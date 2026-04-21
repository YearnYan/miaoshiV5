import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const modulePath = pathToFileURL(path.resolve('src/common/invite.js')).href;

test('validateInviteClaim 对空邀请和自邀请返回 invalid_invite', async () => {
  const mod = await import(`${modulePath}?t=${Date.now()}`);
  const a = mod.validateInviteClaim('', 'u_1');
  assert.equal(a.valid, false);
  assert.equal(a.reason, 'invalid_invite');

  const b = mod.validateInviteClaim('u_1', 'u_1');
  assert.equal(b.valid, false);
  assert.equal(b.reason, 'invalid_invite');
});

test('validateInviteClaim 对有效邀请返回 valid', async () => {
  const mod = await import(`${modulePath}?t=${Date.now()}_2`);
  const c = mod.validateInviteClaim('u_2', 'u_1');
  assert.equal(c.valid, true);
  assert.equal(c.reason, null);
});

test('邀请参数编码解码可保持一致', async () => {
  const raw = 'u_123-abc';
  const encoded = encodeURIComponent(raw);
  const decoded = decodeURIComponent(encoded);
  assert.equal(decoded, raw);
});
