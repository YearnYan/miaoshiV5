<template>
  <view class="pixel-screen paywall-page">
    <image class="pixel-bg" src="/static/ui/hJVrp.png" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot back-hotspot" @click="backToHome" />
      <view class="pixel-hotspot plan-month-hotspot" @click="selectPlan('month')" />
      <view class="pixel-hotspot plan-life-hotspot" @click="selectPlan('lifetime')" />
      <view class="pixel-hotspot plan-trial-hotspot" @click="rewardByInvite" />
      <view class="pixel-hotspot pay-hotspot" @click="pay(selectedPlan)" />
      <view class="pixel-hotspot restore-hotspot" @click="restorePurchase" />
      <view class="pixel-hotspot terms-hotspot" @click="showTerms" />

      <view class="overlay-text reason-text">{{ reasonText }}</view>
      <view class="overlay-text selected-tag" :style="selectedStyle">已选</view>
      <view class="overlay-text pay-amount">{{ payButtonText }}</view>

      <view v-if="loading" class="loading-mask">
        <text class="loading-text">支付处理中...</text>
      </view>
    </view>
  </view>
</template>

<script>
import { PRODUCTS, TELEMETRY_EVENT } from '@/common/config.js';
import { restoreLatestPurchase } from '@/common/order.js';
import { safeNavigateTo, safeReLaunch } from '@/common/nav.js';
import { rewardInvite } from '@/common/service.js';
import { closePaywall } from '@/common/store.js';
import { track } from '@/common/telemetry.js';

export default {
  data() {
    return {
      PRODUCTS,
      loading: false,
      reason: 'free_limit',
      selectedPlan: 'month',
      returnTo: 'index'
    };
  },
  computed: {
    reasonText() {
      if (this.reason === 'dataset_locked') {
        return '当前词库为会员词库，请开通会员或邀请好友获取临时权限。';
      }
      return '免费额度已用完，解锁后可继续无限训练。';
    },
    payButtonText() {
      return this.selectedPlan === 'lifetime' ? '￥29.9 立即解锁' : '￥9.9 立即解锁';
    },
    selectedStyle() {
      if (this.selectedPlan === 'lifetime') {
        return {
          left: '628rpx',
          top: '768rpx'
        };
      }
      if (this.selectedPlan === 'trial') {
        return {
          left: '628rpx',
          top: '902rpx'
        };
      }
      return {
        left: '628rpx',
        top: '634rpx'
      };
    }
  },
  onLoad(query) {
    if (query.reason) {
      this.reason = query.reason;
    }
    if (query.returnTo) {
      this.returnTo = query.returnTo;
    }
  },
  methods: {
    selectPlan(plan) {
      if (plan === 'trial') {
        this.selectedPlan = 'trial';
        return;
      }
      this.selectedPlan = plan;
    },
    async pay(productType) {
      if (productType === 'trial') {
        this.rewardByInvite();
        return;
      }
      track(TELEMETRY_EVENT.PAY_CLICK, {
        productType,
        reason: this.reason
      });
      safeNavigateTo(
        `/pages/pay-confirm/pay-confirm?plan=${productType}&reason=${this.reason}&returnTo=${this.returnTo}`
      );
    },
    async rewardByInvite() {
      if (this.loading) return;
      this.loading = true;
      track(TELEMETRY_EVENT.INVITE_SEND, {
        source: 'paywall'
      });
      try {
        const res = await rewardInvite({
          source: 'paywall'
        });
        if (res?.rewarded) {
          track(TELEMETRY_EVENT.INVITE_SUCCESS, {
            source: 'paywall'
          });
          closePaywall();
          uni.showToast({
            title: '已获得24小时权限',
            icon: 'success'
          });
          setTimeout(() => {
            safeReLaunch('/pages/index/index');
          }, 300);
        }
      } catch (error) {
        uni.showToast({
          title: '领取失败，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    restorePurchase() {
      const restored = restoreLatestPurchase();
      if (!restored.restored) {
        uni.showToast({
          title: '未找到可恢复订单',
          icon: 'none'
        });
        return;
      }
      uni.showToast({
        title: '已恢复会员权益',
        icon: 'success'
      });
      setTimeout(() => {
        safeReLaunch('/pages/index/index');
      }, 260);
    },
    showTerms() {
      safeNavigateTo('/pages/terms/terms?from=paywall');
    },
    backToHome() {
      closePaywall();
      safeReLaunch('/pages/index/index');
    }
  }
};
</script>

<style lang="scss" scoped>
.paywall-page {
  background: #050806;
}

.back-hotspot {
  left: 24rpx;
  top: 102rpx;
  width: 88rpx;
  height: 88rpx;
}

.plan-month-hotspot,
.plan-life-hotspot,
.plan-trial-hotspot {
  left: 48rpx;
  width: 654rpx;
  height: 116rpx;
}

.plan-month-hotspot {
  top: 602rpx;
}

.plan-life-hotspot {
  top: 736rpx;
}

.plan-trial-hotspot {
  top: 870rpx;
}

.pay-hotspot {
  left: 48rpx;
  top: 1028rpx;
  width: 654rpx;
  height: 108rpx;
  border-radius: 54rpx;
}

.restore-hotspot {
  left: 224rpx;
  top: 1158rpx;
  width: 118rpx;
  height: 56rpx;
}

.terms-hotspot {
  left: 406rpx;
  top: 1158rpx;
  width: 118rpx;
  height: 56rpx;
}

.overlay-text {
  position: absolute;
  pointer-events: none;
  color: #e8ffe8;
}

.reason-text {
  left: 88rpx;
  top: 306rpx;
  width: 576rpx;
  font-size: 24rpx;
  line-height: 38rpx;
  color: #9eaba2;
}

.selected-tag {
  width: 60rpx;
  height: 30rpx;
  line-height: 30rpx;
  text-align: center;
  border-radius: 16rpx;
  background: rgba(30, 220, 116, 0.26);
  color: #1edc74;
  font-size: 18rpx;
}

.pay-amount {
  left: 0;
  top: 1061rpx;
  width: 750rpx;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #0f331c;
}

.loading-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-size: 28rpx;
  color: #e8ffe8;
  padding: 16rpx 30rpx;
  border-radius: 20rpx;
  background: rgba(17, 21, 26, 0.94);
  border: 2rpx solid rgba(30, 220, 116, 0.5);
}
</style>


