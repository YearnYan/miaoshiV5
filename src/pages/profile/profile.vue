<template>
  <view class="pixel-screen profile-page">
    <image class="pixel-bg" src="/static/ui/3KjH1.png" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot back-hotspot" @click="goHome" />
      <view class="pixel-hotspot to-vip-hotspot" @click="goVip" />
      <view class="pixel-hotspot row-wrong-hotspot" @click="goWrongbook" />
      <view class="pixel-hotspot row-vip-hotspot" @click="goVip" />
      <view class="pixel-hotspot row-order-hotspot" @click="goOrders" />
      <view class="pixel-hotspot row-terms-hotspot" @click="goTerms" />
      <view class="pixel-hotspot row-privacy-hotspot" @click="goPrivacy" />

      <view class="overlay-text user-name">{{ store.user.nickname }}</view>
      <view class="overlay-text user-uid mono">UID {{ store.user.uid || '-' }}</view>
      <view class="overlay-text vip-text">{{ vipText }}</view>

      <view class="overlay-text stat-1 mono">{{ store.user.vocabCount }}</view>
      <view class="overlay-text stat-2 mono">{{ store.user.bestScore }}</view>
      <view class="overlay-text stat-3 mono">{{ store.user.totalRounds }}</view>
    </view>
  </view>
</template>

<script>
import { safeNavigateTo, safeReLaunch } from '@/common/nav.js';
import { store } from '@/common/store.js';

export default {
  data() {
    return {
      store
    };
  },
  computed: {
    vipText() {
      if (this.store.user.isVip && this.store.user.vipExpireAt > Date.now()) {
        return `VIP 至 ${this.formatDate(this.store.user.vipExpireAt)}`;
      }
      return '当前为免费用户';
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
    goHome() {
      safeReLaunch('/pages/index/index');
    },
    goWrongbook() {
      safeNavigateTo('/pages/wrongbook/wrongbook');
    },
    goVip() {
      safeNavigateTo('/pages/vip/vip');
    },
    goOrders() {
      safeNavigateTo('/pages/orders/orders');
    },
    goTerms() {
      safeNavigateTo('/pages/terms/terms?from=profile');
    },
    goPrivacy() {
      safeNavigateTo('/pages/privacy/privacy?from=profile');
    }
  }
};
</script>

<style lang="scss" scoped>
.profile-page {
  background: #050806;
}

.back-hotspot {
  left: 20rpx;
  top: 98rpx;
  width: 92rpx;
  height: 92rpx;
}

.to-vip-hotspot {
  left: 48rpx;
  top: 664rpx;
  width: 654rpx;
  height: 118rpx;
}

.row-wrong-hotspot,
.row-vip-hotspot,
.row-order-hotspot,
.row-terms-hotspot,
.row-privacy-hotspot {
  left: 48rpx;
  width: 654rpx;
  height: 90rpx;
}

.row-wrong-hotspot {
  top: 806rpx;
}

.row-vip-hotspot {
  top: 902rpx;
}

.row-order-hotspot {
  top: 998rpx;
}

.row-terms-hotspot {
  top: 1094rpx;
}

.row-privacy-hotspot {
  top: 1190rpx;
}

.overlay-text {
  position: absolute;
  pointer-events: none;
  color: #e8ffe8;
}

.user-name {
  left: 176rpx;
  top: 286rpx;
  font-size: 36rpx;
  font-weight: 700;
}

.user-uid {
  left: 176rpx;
  top: 334rpx;
  font-size: 22rpx;
  color: #9eaba2;
}

.vip-text {
  left: 176rpx;
  top: 370rpx;
  font-size: 22rpx;
  color: #79e6a9;
}

.stat-1,
.stat-2,
.stat-3 {
  top: 540rpx;
  font-size: 38rpx;
  font-weight: 700;
}

.stat-1 {
  left: 108rpx;
}

.stat-2 {
  left: 320rpx;
}

.stat-3 {
  left: 548rpx;
}
</style>


