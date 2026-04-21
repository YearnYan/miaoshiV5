<template>
  <view class="pixel-screen page-wrap">
    <image class="pixel-bg" src="/static/ui/cQ3qi.png" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot close-hotspot" @click="cancel" />
      <view class="pixel-hotspot pay-hotspot" @click="confirm" />
      <view class="pixel-hotspot cancel-hotspot" @click="cancel" />

      <view class="overlay-text amount-text">{{ amountLabel }}</view>
      <view class="overlay-text desc-text">支付完成后会员权益即时生效</view>
    </view>
  </view>
</template>

<script>
import { TELEMETRY_EVENT } from '@/common/config.js';
import { forceNavigateTo, safeBack } from '@/common/nav.js';
import { confirmPayment, createOrder } from '@/common/service.js';
import { closePaywall } from '@/common/store.js';
import { track } from '@/common/telemetry.js';

export default {
  data() {
    return {
      plan: 'month',
      reason: 'free_limit',
      returnTo: 'index',
      loading: false
    };
  },
  computed: {
    amountLabel() {
      return this.plan === 'lifetime' ? '￥29.90' : '￥9.90';
    }
  },
  onLoad(query) {
    if (query.plan) {
      this.plan = query.plan;
    }
    if (query.reason) {
      this.reason = query.reason;
    }
    if (query.returnTo) {
      this.returnTo = query.returnTo;
    }
  },
  methods: {
    async confirm() {
      if (this.loading) return;
      this.loading = true;
      uni.showToast({
        title: '正在拉起支付...',
        icon: 'none'
      });
      try {
        const order = await createOrder(this.plan);
        const paid = await confirmPayment(order.orderId, this.plan);
        track(TELEMETRY_EVENT.PAY_SUCCESS, {
          productType: this.plan,
          reason: this.reason
        });
        closePaywall();
        forceNavigateTo(
          `/pages/pay-success/pay-success?plan=${this.plan}&expireAt=${paid.expireAt}&returnTo=${this.returnTo}`
        );
      } catch (error) {
        uni.showToast({
          title: '支付失败，请重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    cancel() {
      if (this.loading) return;
      safeBack();
    }
  }
};
</script>

<style lang="scss" scoped>
.page-wrap {
  background: #050806;
}

.close-hotspot {
  right: 36rpx;
  top: 744rpx;
  width: 66rpx;
  height: 66rpx;
}

.pay-hotspot {
  left: 58rpx;
  top: 1250rpx;
  width: 634rpx;
  height: 96rpx;
}

.cancel-hotspot {
  left: 272rpx;
  top: 1368rpx;
  width: 206rpx;
  height: 66rpx;
}

.overlay-text {
  position: absolute;
  pointer-events: none;
  color: #e8ffe8;
}

.amount-text {
  left: 0;
  top: 944rpx;
  width: 750rpx;
  text-align: center;
  font-size: 62rpx;
  font-weight: 700;
}

.desc-text {
  left: 0;
  top: 1040rpx;
  width: 750rpx;
  text-align: center;
  font-size: 22rpx;
  color: #9eaba2;
}
</style>



