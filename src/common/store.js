import { reactive } from 'vue';
import {
  DEFAULT_DATASET,
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  FREE_LIMIT,
  ROUND_TOTAL_QUESTIONS
} from './config.js';

const STORAGE_KEY = {
  USER: 'fb_user',
  SETTINGS: 'fb_settings',
  OFFLINE_ROUNDS: 'fb_offline_rounds'
};

function nowTs() {
  return Date.now();
}

function loadSafe(key, fallback) {
  try {
    const value = uni.getStorageSync(key);
    return value || fallback;
  } catch (error) {
    return fallback;
  }
}

function saveSafe(key, value) {
  try {
    uni.setStorageSync(key, value);
  } catch (error) {
    console.warn('[store] 持久化失败', key, error);
  }
}

const persistedUser = loadSafe(STORAGE_KEY.USER, null);
const persistedSetting = loadSafe(STORAGE_KEY.SETTINGS, null);

export const store = reactive({
  appReady: false,
  online: true,
  loading: false,
  user: {
    uid: persistedUser?.uid || null,
    nickname: persistedUser?.nickname || '微信用户',
    avatar: persistedUser?.avatar || '',
    isVip: Boolean(persistedUser?.isVip),
    vipExpireAt: persistedUser?.vipExpireAt || null,
    vocabCount: persistedUser?.vocabCount || 1248,
    bestScore: persistedUser?.bestScore || 9820,
    totalRounds: persistedUser?.totalRounds || 86,
    freeConsumed: persistedUser?.freeConsumed || 28,
    unlockedDatasets: persistedUser?.unlockedDatasets || [],
    milestoneSeen: persistedUser?.milestoneSeen || []
  },
  game: {
    datasetKey: persistedSetting?.datasetKey || DEFAULT_DATASET,
    difficulty: persistedSetting?.difficulty || DEFAULT_DIFFICULTY,
    exposureMs: DIFFICULTIES[persistedSetting?.difficulty || DEFAULT_DIFFICULTY].exposureMs,
    score: 0,
    combo: 0,
    maxCombo: 0,
    answered: 0,
    correct: 0,
    currentWordIndex: 0,
    roundId: null,
    roundStartAt: 0,
    phase: 'idle',
    words: [],
    currentWord: null,
    options: [],
    answerHistory: [],
    downgradedPrompted: false
  },
  paywall: {
    visible: false,
    reason: 'free_limit',
    freeLimit: FREE_LIMIT,
    consumed: persistedUser?.freeConsumed || 28
  },
  result: {
    finalScore: 0,
    maxCombo: 0,
    newWords: 0,
    accuracy: 0,
    avgResponseSec: 0,
    wrongAdded: 0,
    grade: 'B',
    rank: {
      friend: { rank: 1, total: 24, surpass: 23 },
      world: { percentile: 5, title: '超凡表现' }
    }
  },
  rank: {
    friendList: [],
    worldList: [],
    myRank: 1248,
    loading: false,
    cacheTs: 0
  },
  profile: {
    wrongCount: 32,
    inviteCount: 2
  },
  offlineEvents: loadSafe('fb_offline_events', []),
  offlineRounds: loadSafe(STORAGE_KEY.OFFLINE_ROUNDS, [])
});

export function persistUser() {
  saveSafe(STORAGE_KEY.USER, {
    uid: store.user.uid,
    nickname: store.user.nickname,
    avatar: store.user.avatar,
    isVip: store.user.isVip,
    vipExpireAt: store.user.vipExpireAt,
    vocabCount: store.user.vocabCount,
    bestScore: store.user.bestScore,
    totalRounds: store.user.totalRounds,
    freeConsumed: store.user.freeConsumed,
    unlockedDatasets: store.user.unlockedDatasets,
    milestoneSeen: store.user.milestoneSeen
  });
}

export function persistSetting() {
  saveSafe(STORAGE_KEY.SETTINGS, {
    datasetKey: store.game.datasetKey,
    difficulty: store.game.difficulty
  });
}

export function persistOfflineRounds() {
  saveSafe(STORAGE_KEY.OFFLINE_ROUNDS, store.offlineRounds);
}

export function persistOfflineEvents() {
  saveSafe('fb_offline_events', store.offlineEvents);
}

export function setUser(payload) {
  Object.assign(store.user, payload || {});
  persistUser();
}

export function isVipActive() {
  return Boolean(store.user.isVip && store.user.vipExpireAt && store.user.vipExpireAt > nowTs());
}

export function hasTemporaryAccess(datasetKey) {
  const now = nowTs();
  return store.user.unlockedDatasets.some(
    (item) => item.datasetKey === datasetKey && item.expireAt > now
  );
}

export function updateDifficulty(difficulty) {
  const hit = DIFFICULTIES[difficulty];
  if (!hit) return;
  store.game.difficulty = difficulty;
  store.game.exposureMs = hit.exposureMs;
  persistSetting();
}

export function updateDataset(datasetKey) {
  store.game.datasetKey = datasetKey;
  persistSetting();
}

export function startRound(words) {
  store.game.words = words || [];
  store.game.currentWordIndex = 0;
  store.game.currentWord = words?.[0] || null;
  store.game.options = [];
  store.game.score = 0;
  store.game.combo = 0;
  store.game.maxCombo = 0;
  store.game.answered = 0;
  store.game.correct = 0;
  store.game.answerHistory = [];
  store.game.roundId = `R${Date.now()}`;
  store.game.roundStartAt = Date.now();
  store.game.phase = 'idle';
  store.game.downgradedPrompted = false;
}

export function setRoundPhase(phase) {
  store.game.phase = phase;
}

export function commitAnswer(record) {
  store.game.answerHistory.push(record);
  store.game.answered += 1;
  if (record.correct) {
    store.game.correct += 1;
    store.game.combo += 1;
    store.game.maxCombo = Math.max(store.game.maxCombo, store.game.combo);
  } else {
    store.game.combo = 0;
  }
  store.game.score += record.scoreDelta;
}

export function nextWord() {
  store.game.currentWordIndex += 1;
  store.game.currentWord = store.game.words[store.game.currentWordIndex] || null;
  store.game.options = [];
}

export function markPaywall(reason) {
  store.paywall.visible = true;
  store.paywall.reason = reason || 'free_limit';
  store.paywall.consumed = store.user.freeConsumed;
}

export function closePaywall() {
  store.paywall.visible = false;
}

export function canContinueRound() {
  return store.game.answered < ROUND_TOTAL_QUESTIONS && Boolean(store.game.currentWord);
}

export function setRoundResult(payload) {
  Object.assign(store.result, payload || {});
}

export function consumeFreeQuota(amount = 1) {
  store.user.freeConsumed += amount;
  store.paywall.consumed = store.user.freeConsumed;
  persistUser();
}

export function addVocabWord(words = []) {
  const prev = store.user.vocabCount;
  store.user.vocabCount += words.length;
  persistUser();
  return {
    prev,
    next: store.user.vocabCount
  };
}

export function appendOfflineRound(round) {
  store.offlineRounds.push(round);
  persistOfflineRounds();
}

export function clearOfflineRounds(roundIds = []) {
  if (!roundIds.length) return;
  store.offlineRounds = store.offlineRounds.filter((item) => !roundIds.includes(item.roundId));
  persistOfflineRounds();
}

export function appendOfflineEvents(events) {
  const list = Array.isArray(events) ? events : [events];
  store.offlineEvents.push(...list);
  persistOfflineEvents();
}

export function clearOfflineEvents(count) {
  if (!count) return;
  store.offlineEvents.splice(0, count);
  persistOfflineEvents();
}
