import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const modulePath = pathToFileURL(path.resolve('src/common/invite-claims.js')).href;

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
}

test('markInviteClaimed 后 hasInviteBeenClaimed 返回 true', async () => {
  mountUniStorage();
  const mod = await import(`${modulePath}?t=${Date.now()}`);
  assert.equal(mod.hasInviteBeenClaimed('u_1', 'u_inviter'), false);
  mod.markInviteClaimed('u_1', 'u_inviter', {
    expireAt: Date.now() + 1000
  });
  assert.equal(mod.hasInviteBeenClaimed('u_1', 'u_inviter'), true);
});

test('邀请领取记录按用户隔离', async () => {
  mountUniStorage();
  const mod = await import(`${modulePath}?t=${Date.now()}_2`);
  mod.markInviteClaimed('u_1', 'u_inviter', {});
  assert.equal(mod.hasInviteBeenClaimed('u_2', 'u_inviter'), false);
});

