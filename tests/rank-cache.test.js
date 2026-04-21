import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const modulePath = pathToFileURL(path.resolve('src/common/rank-cache.js')).href;

function mountUniStorage(seed = {}) {
  const storage = new Map(Object.entries(seed));
  globalThis.uni = {
    getStorageSync(key) {
      return storage.get(key);
    },
    setStorageSync(key, value) {
      storage.set(key, value);
    }
  };
  return storage;
}

test('setRankCache 与 getRankCache 可读写榜单缓存', async () => {
  mountUniStorage();
  const mod = await import(`${modulePath}?t=${Date.now()}`);
  mod.setRankCache('friend', {
    list: [{ uid: 'u1', rank: 1, score: 100 }],
    total: 1,
    cacheTs: Date.now()
  });
  const hit = mod.getRankCache('friend');
  assert.equal(Array.isArray(hit.list), true);
  assert.equal(hit.total, 1);
});

test('isRankCacheFresh 可正确判断缓存时效', async () => {
  mountUniStorage();
  const mod = await import(`${modulePath}?t=${Date.now()}_2`);
  const now = Date.now();
  assert.equal(mod.isRankCacheFresh(now), true);
  assert.equal(mod.isRankCacheFresh(now - mod.getRankCacheTtlMs() - 1), false);
});

