<template>
  <scroll-view class="doc-page" scroll-y>
    <view class="doc-header">
      <view class="doc-back" @click="goBack">返回</view>
      <view class="doc-title">隐私政策</view>
    </view>
    <view class="doc-content">
      <view class="doc-section">更新时间：2026-04-21</view>
      <view class="doc-section">1. 信息收集：我们仅收集完成训练服务所需的基础账号与行为数据。</view>
      <view class="doc-section">2. 信息用途：用于训练统计、排行榜展示、会员权益同步与问题排查。</view>
      <view class="doc-section">3. 存储方式：训练与订单数据会存储于本地缓存与云端服务。</view>
      <view class="doc-section">4. 安全策略：采取访问控制与最小权限策略保护数据安全。</view>
      <view class="doc-section">5. 用户权利：你可在账号页发起数据查看与清理申请。</view>
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


