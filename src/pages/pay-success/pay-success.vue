<template>
  <view class="pixel-screen page-wrap">
    <image class="pixel-bg" src="/static/ui/k273O.png" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot start-hotspot" @click="startNow" />
      <view class="pixel-hotspot home-hotspot" @click="goHome" />

      <view class="overlay-text status-text">{{ statusText }}</view>
      <view class="overlay-text expire-text">{{ expireText }}</view>
    </view>
  </view>
</template>

<script>
import { safeReLaunch } from '@/common/nav.js';

export default {
  data() {
    return {
      plan: 'month',
      expireAt: 0,
      returnTo: 'index'
    };
  },
  computed: {
    statusText() {
      return this.plan === 'lifetime' ? '终身会员已开通' : '月度会员已开通';
    },
    expireText() {
      if (!this.expireAt) return '权益状态同步中...';
      const date = new Date(Number(this.expireAt));
      const yyyy = date.getFullYear();
      const mm = `${date.getMonth() + 1}`.padStart(2, '0');
      const dd = `${date.getDate()}`.padStart(2, '0');
      return `到期时间：${yyyy}-${mm}-${dd}`;
    }
  },
  onLoad(query) {
    if (query.plan) {
      this.plan = query.plan;
    }
    if (query.expireAt) {
      this.expireAt = Number(query.expireAt);
    }
    if (query.returnTo) {
      this.returnTo = query.returnTo;
    }
  },
  methods: {
    startNow() {
      if (this.returnTo === 'game') {
        safeReLaunch('/pages/game/game');
        return;
      }
      safeReLaunch('/pages/index/index');
    },
    goHome() {
      safeReLaunch('/pages/index/index');
    }
  }
};
</script>

<style lang="scss" scoped>
.page-wrap {
  background: #050806;
}

.start-hotspot {
  left: 48rpx;
  top: 1230rpx;
  width: 654rpx;
  height: 102rpx;
}

.home-hotspot {
  left: 48rpx;
  top: 1348rpx;
  width: 654rpx;
  height: 86rpx;
}

.overlay-text {
  position: absolute;
  pointer-events: none;
  color: #e8ffe8;
}

.status-text {
  left: 0;
  top: 522rpx;
  width: 750rpx;
  text-align: center;
  font-size: 40rpx;
  font-weight: 700;
}

.expire-text {
  left: 0;
  top: 582rpx;
  width: 750rpx;
  text-align: center;
  font-size: 24rpx;
  color: #9eaba2;
}
</style>


