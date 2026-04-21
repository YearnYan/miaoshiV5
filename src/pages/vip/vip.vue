<template>
  <view class="pixel-screen vip-page">
    <image class="pixel-bg" src="/static/ui/8taa9.png" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot back-hotspot" @click="goBack" />
      <view class="pixel-hotspot upgrade-hotspot" @click="goPaywall" />
      <view class="pixel-hotspot order-hotspot" @click="showOrder" />

      <view class="overlay-text vip-state">{{ vipStatus }}</view>
      <view class="overlay-text expire-date">{{ expireText }}</view>
    </view>
  </view>
</template>

<script>
import { safeBack, safeNavigateTo } from '@/common/nav.js';
import { store } from '@/common/store.js';

export default {
  data() {
    return {
      store
    };
  },
  computed: {
    vipStatus() {
      if (this.store.user.isVip && this.store.user.vipExpireAt > Date.now()) {
        return '已开通会员';
      }
      return '当前未开通';
    },
    expireText() {
      if (this.store.user.isVip && this.store.user.vipExpireAt > Date.now()) {
        return `到期 ${this.formatDate(this.store.user.vipExpireAt)}`;
      }
      return '开通后立即生效';
    }
  },
  methods: {
    formatDate(ts) {
      const date = new Date(ts);
      const yyyy = date.getFullYear();
      const mm = `${date.getMonth() + 1}`.padStart(2, '0');
      const dd = `${date.getDate()}`.padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    },
    goBack() {
      safeBack();
    },
    goPaywall() {
      safeNavigateTo('/pages/paywall/paywall?reason=free_limit');
    },
    showOrder() {
      safeNavigateTo('/pages/orders/orders');
    }
  }
};
</script>

<style lang="scss" scoped>
.vip-page {
  background: #050806;
}

.back-hotspot {
  left: 24rpx;
  top: 102rpx;
  width: 88rpx;
  height: 88rpx;
}

.upgrade-hotspot {
  left: 48rpx;
  top: 1248rpx;
  width: 654rpx;
  height: 98rpx;
  border-radius: 50rpx;
}

.order-hotspot {
  left: 48rpx;
  top: 1362rpx;
  width: 654rpx;
  height: 88rpx;
}

.overlay-text {
  position: absolute;
  pointer-events: none;
  color: #e8ffe8;
}

.vip-state {
  left: 98rpx;
  top: 468rpx;
  font-size: 38rpx;
  font-weight: 700;
}

.expire-date {
  left: 98rpx;
  top: 522rpx;
  font-size: 24rpx;
  color: #9eaba2;
}
</style>


