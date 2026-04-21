<template>
  <scroll-view class="list-page" scroll-y>
    <view class="list-header">
      <view class="list-back" @click="goBack">返回</view>
      <view class="list-title">订单记录</view>
    </view>

    <view class="list-content">
      <view v-if="!orders.length" class="empty">暂无订单记录</view>
      <view v-for="item in orders" :key="item.orderId" class="order-card">
        <view class="order-title">{{ item.title }}</view>
        <view class="order-meta">订单号：{{ item.orderId }}</view>
        <view class="order-meta">金额：￥{{ (item.amountFen / 100).toFixed(2) }}</view>
        <view class="order-meta">时间：{{ formatDate(item.createdAt) }}</view>
        <view class="order-status">状态：{{ item.status === 'success' ? '已支付' : '处理中' }}</view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import { safeBack } from '@/common/nav.js';
import { listOrders } from '@/common/order.js';

export default {
  data() {
    return {
      orders: []
    };
  },
  onShow() {
    this.orders = listOrders();
  },
  methods: {
    goBack() {
      safeBack();
    },
    formatDate(ts) {
      const date = new Date(Number(ts));
      const yyyy = date.getFullYear();
      const mm = `${date.getMonth() + 1}`.padStart(2, '0');
      const dd = `${date.getDate()}`.padStart(2, '0');
      const hh = `${date.getHours()}`.padStart(2, '0');
      const mi = `${date.getMinutes()}`.padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.list-page {
  height: 100vh;
  background: #050806;
  color: #e8ffe8;
}

.list-header {
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}

.list-back {
  position: absolute;
  left: 28rpx;
  top: 34rpx;
  font-size: 28rpx;
  color: #9eaba2;
}

.list-title {
  font-size: 32rpx;
  font-weight: 700;
}

.list-content {
  padding: 26rpx;
}

.empty {
  margin-top: 70rpx;
  text-align: center;
  color: #9eaba2;
  font-size: 28rpx;
}

.order-card {
  margin-bottom: 24rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.order-title {
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.order-meta,
.order-status {
  font-size: 24rpx;
  color: #d9e7de;
  line-height: 42rpx;
}
</style>


