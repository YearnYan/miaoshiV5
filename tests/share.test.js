import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const modulePath = pathToFileURL(path.resolve('src/common/share.js')).href;

test('buildSharePayload 会生成可带邀请参数的分享路径', async () => {
  const mod = await import(`${modulePath}?t=${Date.now()}`);
  const payload = mod.buildSharePayload({
    uid: 'u_123',
    nickname: '测试用户',
    score: 9520,
    grade: 'S',
    source: 'poster'
  });
  assert.equal(payload.path.includes('inviteUid=u_123'), true);
  assert.equal(payload.path.includes('from=poster'), true);
  assert.equal(payload.title.includes('9520'), true);
  assert.equal(payload.imageUrl, '/static/ui/MJBSd.png');
});

