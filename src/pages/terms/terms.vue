<template>
  <scroll-view class="doc-page" scroll-y>
    <view class="doc-header">
      <view class="doc-back" @click="goBack">返回</view>
      <view class="doc-title">用户协议</view>
    </view>
    <view class="doc-content">
      <view class="doc-section">更新时间：2026-04-21</view>
      <view class="doc-section">1. 服务说明：本小程序提供词汇闪视训练、成绩统计、会员权益等功能。</view>
      <view class="doc-section">2. 账号与数据：登录后会保存你的训练记录、词汇量、订单与会员状态。</view>
      <view class="doc-section">3. 使用规范：禁止利用脚本刷分、恶意请求、攻击服务端接口。</view>
      <view class="doc-section">4. 会员规则：购买成功即刻生效，权益以订单记录与账号状态为准。</view>
      <view class="doc-section">5. 协议更新：协议调整后将以页面最新版本为准。</view>
    </view>
  </scroll-view>
</template>

<script>
import { safeBack } from '@/common/nav.js';

export default {
  methods: {
    goBack() {
      safeBack();
    }
  }
};
</script>

<style lang="scss" scoped>
.doc-page {
  height: 100vh;
  background: #050806;
  color: #e8ffe8;
}

.doc-header {
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}

.doc-back {
  position: absolute;
  left: 28rpx;
  top: 34rpx;
  font-size: 28rpx;
  color: #9eaba2;
}

.doc-title {
  font-size: 32rpx;
  font-weight: 700;
}

.doc-content {
  padding: 30rpx;
}

.doc-section {
  margin-bottom: 24rpx;
  line-height: 46rpx;
  font-size: 28rpx;
  color: #d9e7de;
}
</style>


