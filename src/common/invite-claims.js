const INVITE_CLAIMS_KEY = 'fb_invite_claims_v1';

function readAllClaims() {
  try {
    const value = uni.getStorageSync(INVITE_CLAIMS_KEY);
    return value && typeof value === 'object' ? value : {};
  } catch (error) {
    return {};
  }
}

function writeAllClaims(value) {
  try {
    uni.setStorageSync(INVITE_CLAIMS_KEY, value);
  } catch (error) {
    // 缓存失败不阻塞主流程
  }
}

function normalizeUserKey(uid) {
  return uid || '__guest__';
}

export function hasInviteBeenClaimed(uid, inviterUid) {
  if (!inviterUid) return false;
  const all = readAllClaims();
  const userKey = normalizeUserKey(uid);
  return Boolean(all[userKey]?.[inviterUid]);
}

export function markInviteClaimed(uid, inviterUid, payload = {}) {
  if (!inviterUid) return null;
  const all = readAllClaims();
  const userKey = normalizeUserKey(uid);
  if (!all[userKey] || typeof all[userKey] !== 'object') {
    all[userKey] = {};
  }
  const record = {
    inviterUid,
    claimedAt: Date.now(),
    expireAt: Number(payload.expireAt || 0),
    source: payload.source || 'share_link'
  };
  all[userKey][inviterUid] = record;
  writeAllClaims(all);
  return record;
}

export function getInviteClaim(uid, inviterUid) {
  if (!inviterUid) return null;
  const all = readAllClaims();
  const userKey = normalizeUserKey(uid);
  return all[userKey]?.[inviterUid] || null;
}

