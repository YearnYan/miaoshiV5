import {
  apiCheckAuth,
  apiCreateOrder,
  apiInviteReward,
  apiPayNotify,
  apiRankQuery,
  apiSubmitRound
} from './api.js';
import { PRODUCTS } from './config.js';
import { getInviteClaim, hasInviteBeenClaimed, markInviteClaimed } from './invite-claims.js';
import { validateInviteClaim } from './invite.js';
import { mockFriendRanks, mockWorldRanks } from './mock-data.js';
import { getRankCache, isRankCacheFresh, setRankCache } from './rank-cache.js';
import {
  appendOfflineRound,
  clearOfflineRounds,
  persistUser,
  setUser,
  store
} from './store.js';
import { createOrUpdatePaidOrder, findOrderById } from './order.js';
import { calculateRoundSummary } from './scoring.js';

function withTimeout(promise, timeout = 4000) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('请求超时')), timeout);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

function buildMockUser() {
  return {
    uid: store.user.uid || `u_${Date.now()}`,
    nickname: '微信用户',
    avatar: '',
    isVip: store.user.isVip,
    vipExpireAt: store.user.vipExpireAt,
    vocabCount: store.user.vocabCount,
    bestScore: store.user.bestScore,
    totalRounds: store.user.totalRounds,
    freeConsumed: store.user.freeConsumed,
    unlockedDatasets: store.user.unlockedDatasets
  };
}

export async function doLogin() {
  const user = buildMockUser();
  setUser(user);
  return user;
}

export async function checkAuth() {
  try {
    const result = await withTimeout(apiCheckAuth());
    if (result.user) {
      setUser(result.user);
    }
    return result.user || null;
  } catch (error) {
    return store.user.uid ? store.user : null;
  }
}

export async function submitRound(payload) {
  try {
    const result = await withTimeout(apiSubmitRound(payload), 6000);
    return result;
  } catch (error) {
    // 离线兜底：本地复算，记录待补偿
    const summary = calculateRoundSummary(payload.answers, payload.difficulty);
    const fallback = {
      roundId: payload.roundId || `R${Date.now()}`,
      finalScore: summary.finalScore,
      newWords: summary.newWords,
      rankChanged: {
        friendDelta: 2,
        worldDelta: 11
      },
      serverFallback: true
    };
    appendOfflineRound({
      ...payload,
      ...fallback
    });
    return fallback;
  }
}

export async function queryRank(type = 'friend', page = 1, pageSize = 50, options = {}) {
  const forceRefresh = Boolean(options.forceRefresh);
  const cached = getRankCache(type);
  if (!forceRefresh && cached && isRankCacheFresh(cached.cacheTs)) {
    return {
      ...cached,
      cacheHit: true
    };
  }

  try {
    const result = await withTimeout(
      apiRankQuery({
        type,
        page,
        pageSize
      })
    );
    const normalized = {
      list: result.list || [],
      total: Number(result.total || (result.list || []).length),
      cacheTs: Number(result.cacheTs || Date.now())
    };
    setRankCache(type, normalized);
    return {
      ...normalized,
      cacheHit: false
    };
  } catch (error) {
    if (cached?.list?.length) {
      return {
        ...cached,
        fallback: true,
        stale: true
      };
    }
    const list = type === 'world' ? mockWorldRanks : mockFriendRanks;
    const fallback = {
      list,
      total: list.length,
      cacheTs: Date.now(),
      fallback: true
    };
    setRankCache(type, fallback);
    return fallback;
  }
}

export async function createOrder(productType = 'month') {
  const product = PRODUCTS[productType] || PRODUCTS.month;
  try {
    return await withTimeout(
      apiCreateOrder({
        productType: product.type
      }),
      5000
    );
  } catch (error) {
    return {
      orderId: `FB${Date.now()}`,
      payParams: {
        mock: true
      },
      amountFen: product.amountFen
    };
  }
}

export async function confirmPayment(orderId, productType = 'month', transactionId = '') {
  const existed = findOrderById(orderId);
  if (existed?.status === 'success') {
    const now = Date.now();
    const isLifetime = productType === 'lifetime';
    const expireAt = isLifetime ? now + 99 * 365 * 24 * 60 * 60 * 1000 : now + 30 * 24 * 60 * 60 * 1000;
    store.user.isVip = true;
    store.user.vipExpireAt = expireAt;
    persistUser();
    return {
      orderId: existed.orderId,
      effectiveAt: now,
      expireAt,
      duplicated: true
    };
  }

  const now = Date.now();
  const monthMs = 30 * 24 * 60 * 60 * 1000;
  const isLifetime = productType === 'lifetime';
  const expireAt = isLifetime ? now + 99 * 365 * 24 * 60 * 60 * 1000 : now + monthMs;

  try {
    await withTimeout(
      apiPayNotify({
        orderId,
        transactionId: transactionId || `tx_${Date.now()}`,
        productType
      }),
      5000
    );
  } catch (error) {
    // mock 环境忽略回调异常
  }

  store.user.isVip = true;
  store.user.vipExpireAt = expireAt;
  persistUser();
  createOrUpdatePaidOrder(productType, {
    orderId,
    title: productType === 'lifetime' ? '终身会员' : '月度会员'
  });

  return {
    orderId,
    effectiveAt: now,
    expireAt
  };
}

export async function rewardInvite(payload) {
  try {
    return await withTimeout(apiInviteReward(payload));
  } catch (error) {
    const expireAt = Date.now() + 24 * 60 * 60 * 1000;
    store.user.unlockedDatasets.push({
      datasetKey: store.game.datasetKey,
      expireAt
    });
    persistUser();
    return {
      rewarded: true,
      expireAt,
      fallback: true
    };
  }
}

export async function claimInviteReward(inviterUid) {
  const validation = validateInviteClaim(inviterUid, store.user.uid);
  if (!validation.valid) {
    return {
      rewarded: false,
      reason: validation.reason
    };
  }
  if (hasInviteBeenClaimed(store.user.uid, inviterUid)) {
    return {
      rewarded: false,
      reason: 'already_claimed',
      claim: getInviteClaim(store.user.uid, inviterUid)
    };
  }

  const result = await rewardInvite({
    source: 'share_link',
    inviterUid
  });
  if (result?.rewarded) {
    const claim = markInviteClaimed(store.user.uid, inviterUid, {
      expireAt: result.expireAt,
      source: 'share_link'
    });
    return {
      ...result,
      claim
    };
  }
  return result;
}

export async function syncOfflineRounds() {
  if (!store.offlineRounds.length) return;
  const synced = [];

  for (const round of store.offlineRounds) {
    try {
      await apiSubmitRound(round);
      synced.push(round.roundId);
    } catch (error) {
      // 保留失败项，下一轮再补偿
    }
  }

  clearOfflineRounds(synced);
}
