const RANK_CACHE_KEY = 'fb_rank_cache_v1';
const RANK_CACHE_TTL_MS = 5 * 60 * 1000;

function readAllCache() {
  try {
    const value = uni.getStorageSync(RANK_CACHE_KEY);
    return value && typeof value === 'object' ? value : {};
  } catch (error) {
    return {};
  }
}

function writeAllCache(cache) {
  try {
    uni.setStorageSync(RANK_CACHE_KEY, cache);
  } catch (error) {
    // 缓存失败不阻塞主流程
  }
}

export function getRankCache(type) {
  const all = readAllCache();
  const hit = all[type];
  if (!hit || !Array.isArray(hit.list)) return null;
  return hit;
}

export function setRankCache(type, payload) {
  const all = readAllCache();
  all[type] = {
    list: Array.isArray(payload.list) ? payload.list : [],
    total: Number(payload.total || 0),
    cacheTs: Number(payload.cacheTs || Date.now())
  };
  writeAllCache(all);
  return all[type];
}

export function isRankCacheFresh(cacheTs, ttlMs = RANK_CACHE_TTL_MS) {
  if (!cacheTs) return false;
  return Date.now() - Number(cacheTs) <= ttlMs;
}

export function getRankCacheTtlMs() {
  return RANK_CACHE_TTL_MS;
}

