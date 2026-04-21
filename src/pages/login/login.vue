<template>
  <view class="pixel-screen login-page">
    <image class="pixel-bg" src="/static/ui/CEiWR.png" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot back-hotspot" @click="goBackHome" />
      <view class="pixel-hotspot login-hotspot" @click="loginByWechat" />
      <view class="pixel-hotspot agree-hotspot" @click="toggleAgree" />
      <view class="pixel-hotspot terms-hotspot" @click="openTerms" />
      <view class="pixel-hotspot privacy-hotspot" @click="openPrivacy" />
      <view class="pixel-hotspot retry-hotspot" @click="loginByWechat" />

      <view v-if="!agreed" class="agree-unchecked" />

      <view v-if="loading" class="loading-mask">
        <text class="loading-text">登录中...</text>
      </view>
    </view>
  </view>
</template>

<script>
import { safeNavigateTo, safeReLaunch } from '@/common/nav.js';
import { TELEMETRY_EVENT } from '@/common/config.js';
import { doLogin } from '@/common/service.js';
import { track } from '@/common/telemetry.js';

export default {
  data() {
    return {
      loading: false,
      agreed: true,
      redirect: '/pages/index/index'
    };
  },
  onLoad(query) {
    if (query.redirect) {
      this.redirect = decodeURIComponent(query.redirect);
    }
  },
  methods: {
    toggleAgree() {
      this.agreed = !this.agreed;
    },
    async loginByWechat() {
      if (this.loading) return;
      if (!this.agreed) {
        uni.showToast({
          title: '请先同意协议',
          icon: 'none'
        });
        return;
      }

      this.loading = true;
      try {
        const user = await doLogin();
        track(TELEMETRY_EVENT.LOGIN_SUCCESS, {
          uid: user.uid
        });
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
        setTimeout(() => {
          safeReLaunch(this.redirect || '/pages/index/index');
        }, 300);
      } catch (error) {
        uni.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    openTerms() {
      safeNavigateTo('/pages/terms/terms?from=login');
    },
    openPrivacy() {
      safeNavigateTo('/pages/privacy/privacy?from=login');
    },
    goBackHome() {
      safeReLaunch('/pages/index/index');
    }
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  background: #050806;
}

.back-hotspot {
  left: 34rpx;
  top: 98rpx;
  width: 94rpx;
  height: 94rpx;
}

.login-hotspot {
  left: 48rpx;
  top: 904rpx;
  width: 654rpx;
  height: 112rpx;
  border-radius: 56rpx;
}

.agree-hotspot {
  left: 50rpx;
  top: 1048rpx;
  width: 620rpx;
  height: 84rpx;
}

.terms-hotspot {
  left: 210rpx;
  top: 1060rpx;
  width: 170rpx;
  height: 56rpx;
}

.privacy-hotspot {
  left: 390rpx;
  top: 1060rpx;
  width: 170rpx;
  height: 56rpx;
}

.retry-hotspot {
  left: 240rpx;
  top: 1154rpx;
  width: 280rpx;
  height: 58rpx;
}

.agree-unchecked {
  position: absolute;
  left: 56rpx;
  top: 1068rpx;
  width: 30rpx;
  height: 30rpx;
  border-radius: 8rpx;
  border: 2rpx solid #ff4d4f;
  background: rgba(8, 10, 9, 0.9);
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
  padding: 16rpx 28rpx;
  border-radius: 20rpx;
  border: 2rpx solid rgba(30, 220, 116, 0.5);
  background: rgba(17, 21, 26, 0.95);
}
</style>


