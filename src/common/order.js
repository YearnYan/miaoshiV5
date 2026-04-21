import { persistUser, store } from './store.js';

function buildOrder(productType = 'month', extra = {}) {
  const now = Date.now();
  return {
    orderId: extra.orderId || ORD_,
    productType,
    amountFen: Number(extra.amountFen ?? (productType === 'lifetime' ? 2990 : 990)),
    createdAt: now,
    paidAt: now,
    status: 'success',
    title: extra.title || (productType === 'lifetime' ? '终身会员' : '月度会员')
  };
}

function getVipExpireAt(productType = 'month') {
  const now = Date.now();
  if (productType === 'lifetime') {
    return now + 99 * 365 * 24 * 60 * 60 * 1000;
  }
  return now + 30 * 24 * 60 * 60 * 1000;
}

export function appendOrder(order) {
  try {
    const list = uni.getStorageSync('fb_orders') || [];
    const index = list.findIndex((item) => item.orderId === order.orderId);
    if (index >= 0) {
      list[index] = {
        ...list[index],
        ...order
      };
    } else {
      list.unshift(order);
    }
    uni.setStorageSync('fb_orders', list.slice(0, 50));
    return order;
  } catch (error) {
    return order;
  }
}

export function listOrders() {
  try {
    const list = uni.getStorageSync('fb_orders') || [];
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];
  }
}

export function findOrderById(orderId) {
  if (!orderId) return null;
  return listOrders().find((item) => item.orderId === orderId) || null;
}

export function createPaidOrder(productType = 'month') {
  const order = buildOrder(productType);
  appendOrder(order);
  return order;
}

export function createOrUpdatePaidOrder(productType = 'month', extra = {}) {
  const order = buildOrder(productType, extra);
  appendOrder(order);
  return order;
}

export function restoreLatestPurchase() {
  const orders = listOrders();
  if (!orders.length) {
    return {
      restored: false,
      reason: 'no_order'
    };
  }

  const latest = orders[0];
  const expireAt = getVipExpireAt(latest.productType);
  store.user.isVip = true;
  store.user.vipExpireAt = expireAt;
  persistUser();

  return {
    restored: true,
    order: latest,
    expireAt
  };
}
