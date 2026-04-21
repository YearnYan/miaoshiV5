import { DATASETS, FREE_LIMIT } from './config.js';

export function getDatasetMeta(datasetKey) {
  return DATASETS.find((item) => item.key === datasetKey) || null;
}

export function isDatasetLocked(datasetKey, user) {
  const meta = getDatasetMeta(datasetKey);
  if (!meta) return false;
  if (!meta.locked) return false;

  const now = Date.now();
  const isVip =
    Boolean(user?.isVip) && Boolean(user?.vipExpireAt) && Number(user.vipExpireAt) > now;

  if (isVip) return false;

  const hasTemp = (user?.unlockedDatasets || []).some(
    (item) => item.datasetKey === datasetKey && item.expireAt > now
  );

  return !hasTemp;
}

export function shouldBlockByQuota(user, freeLimit = FREE_LIMIT) {
  if (!user) return true;
  const now = Date.now();
  const isVip =
    Boolean(user.isVip) && Boolean(user.vipExpireAt) && Number(user.vipExpireAt) > now;
  if (isVip) return false;
  return Number(user.freeConsumed || 0) >= freeLimit;
}

export function evaluateEntitlement({ user, datasetKey, freeLimit = FREE_LIMIT }) {
  if (!user?.uid) {
    return {
      blocked: true,
      reason: 'need_login'
    };
  }
  if (isDatasetLocked(datasetKey, user)) {
    return {
      blocked: true,
      reason: 'dataset_locked'
    };
  }
  if (shouldBlockByQuota(user, freeLimit)) {
    return {
      blocked: true,
      reason: 'free_limit'
    };
  }
  return {
    blocked: false,
    reason: null
  };
}
