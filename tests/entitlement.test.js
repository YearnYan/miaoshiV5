const test = require('node:test');
const assert = require('node:assert/strict');

test('evaluateEntitlement 对未登录用户返回 need_login', async () => {
  const { evaluateEntitlement } = await import('../src/common/entitlement.js');
  const result = evaluateEntitlement({
    user: null,
    datasetKey: 'cet6',
    freeLimit: 100
  });
  assert.equal(result.blocked, true);
  assert.equal(result.reason, 'need_login');
});

test('evaluateEntitlement 对锁库免费用户返回 dataset_locked', async () => {
  const { evaluateEntitlement } = await import('../src/common/entitlement.js');
  const result = evaluateEntitlement({
    user: {
      uid: 'u1',
      isVip: false,
      vipExpireAt: null,
      freeConsumed: 0,
      unlockedDatasets: []
    },
    datasetKey: 'gre',
    freeLimit: 100
  });
  assert.equal(result.blocked, true);
  assert.equal(result.reason, 'dataset_locked');
});

test('evaluateEntitlement 对额度耗尽用户返回 free_limit', async () => {
  const { evaluateEntitlement } = await import('../src/common/entitlement.js');
  const result = evaluateEntitlement({
    user: {
      uid: 'u1',
      isVip: false,
      vipExpireAt: null,
      freeConsumed: 100,
      unlockedDatasets: []
    },
    datasetKey: 'cet6',
    freeLimit: 100
  });
  assert.equal(result.blocked, true);
  assert.equal(result.reason, 'free_limit');
});

test('evaluateEntitlement 对有效 VIP 用户放行', async () => {
  const { evaluateEntitlement } = await import('../src/common/entitlement.js');
  const result = evaluateEntitlement({
    user: {
      uid: 'u1',
      isVip: true,
      vipExpireAt: Date.now() + 24 * 60 * 60 * 1000,
      freeConsumed: 999,
      unlockedDatasets: []
    },
    datasetKey: 'gre',
    freeLimit: 100
  });
  assert.equal(result.blocked, false);
  assert.equal(result.reason, null);
});
