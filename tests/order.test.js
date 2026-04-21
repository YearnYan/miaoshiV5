import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const modulePath = pathToFileURL(path.resolve('src/common/order.js')).href;

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

test('appendOrder 对同一 orderId 进行覆盖而非重复新增', async () => {
  const storage = mountUniStorage({ fb_orders: [] });
  const mod = await import(`${modulePath}?t=${Date.now()}`);
  mod.appendOrder({ orderId: 'ORD_1', productType: 'month', status: 'pending', amountFen: 990 });
  mod.appendOrder({ orderId: 'ORD_1', productType: 'month', status: 'success', amountFen: 990 });
  const list = storage.get('fb_orders');
  assert.equal(list.length, 1);
  assert.equal(list[0].status, 'success');
});

