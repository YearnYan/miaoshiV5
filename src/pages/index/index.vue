<template>
  <view class="pixel-screen home-page">
    <image class="pixel-bg" src="/static/ui/874RE.png" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot diff-hotspot" @click="openDifficulty" />
      <view class="pixel-hotspot library-hotspot" @click="goLibrary" />
      <view class="pixel-hotspot start-hotspot" @click="startChallenge" />
      <view class="pixel-hotspot rank-hotspot" @click="goRank" />
      <view class="pixel-hotspot profile-hotspot" @click="goProfile" />

      <view class="overlay-text score-value mono">{{ store.user.bestScore }}</view>
      <view class="overlay-text vocab-value mono">{{ store.user.vocabCount }}</view>
      <view class="overlay-text quota-value">{{ freeRemain }} / {{ store.paywall.freeLimit }}</view>
      <view class="overlay-text dataset-value">{{ datasetName }}</view>
      <view class="overlay-text diff-value">{{ difficultyLabel }}</view>
      <view class="overlay-text vip-value">{{ vipText }}</view>

      <view class="quota-track">
        <view class="quota-progress" :style="{ width: quotaPercent + '%' }" />
      </view>
    </view>
  </view>
</template>

<script>
import { DATASETS, DIFFICULTIES, TELEMETRY_EVENT } from '@/common/config.js';
import { evaluateEntitlement } from '@/common/entitlement.js';
import { safeNavigateTo } from '@/common/nav.js';
import { claimInviteReward } from '@/common/service.js';
import { track } from '@/common/telemetry.js';
import { markPaywall, setRoundPhase, store } from '@/common/store.js';

const PENDING_INVITE_KEY = 'fb_pending_invite_uid';

export default {
  data() {
    return {
      store,
      inviteUid: '',
      inviteClaimed: false
    };
  },
  computed: {
    difficultyLabel() {
      return DIFFICULTIES[this.store.game.difficulty]?.label || '极限档';
    },
    datasetName() {
      return DATASETS.find((item) => item.key === this.store.game.datasetKey)?.name || '未知词库';
    },
    freeRemain() {
      return Math.max(this.store.paywall.freeLimit - this.store.user.freeConsumed, 0);
    },
    quotaPercent() {
      const total = this.store.paywall.freeLimit || 1;
      return Math.min((this.freeRemain / total) * 100, 100);
    },
    vipText() {
      if (this.store.user.isVip && this.store.user.vipExpireAt > Date.now()) {
        return 'VIP 可用';
      }
      return '免费用户';
    }
  },
  onLoad(query) {
    if (query.inviteUid) {
      this.inviteUid = decodeURIComponent(query.inviteUid);
      this.persistPendingInvite(this.inviteUid);
      return;
    }
    this.inviteUid = this.readPendingInvite();
  },
  async onShow() {
    setRoundPhase('idle');
    await this.tryClaimInviteReward();
  },
  methods: {
    async tryClaimInviteReward() {
      if (!this.inviteUid || this.inviteClaimed) return;
      if (!this.store.user.uid) return;
      const res = await claimInviteReward(this.inviteUid);
      this.inviteClaimed = true;
      this.clearPendingInvite();
      if (!res?.rewarded) return;
      track(TELEMETRY_EVENT.INVITE_SUCCESS, {
        source: 'share_link',
        inviterUid: this.inviteUid
      });
      uni.showToast({
        title: '已获得24小时临时权限',
        icon: 'success'
      });
    },
    persistPendingInvite(inviteUid) {
      if (!inviteUid) return;
      try {
        uni.setStorageSync(PENDING_INVITE_KEY, inviteUid);
      } catch (error) {
        // 忽略缓存异常，不阻塞主流程
      }
    },
    readPendingInvite() {
      try {
        return uni.getStorageSync(PENDING_INVITE_KEY) || '';
      } catch (error) {
        return '';
      }
    },
    clearPendingInvite() {
      try {
        uni.removeStorageSync(PENDING_INVITE_KEY);
      } catch (error) {
        // 忽略缓存异常
      }
    },
    ensureLogin(redirectPath) {
      if (this.store.user.uid) return true;
      const encoded = encodeURIComponent(redirectPath);
      safeNavigateTo(`/pages/login/login?redirect=${encoded}`);
      return false;
    },
    openDifficulty() {
      safeNavigateTo('/pages/difficulty/difficulty?from=index');
    },
    goLibrary() {
      safeNavigateTo('/pages/library/library');
    },
    startChallenge() {
      if (!this.ensureLogin('/pages/game/game')) return;

      const entitlement = evaluateEntitlement({
        user: this.store.user,
        datasetKey: this.store.game.datasetKey,
        freeLimit: this.store.paywall.freeLimit
      });
      if (entitlement.blocked) {
        markPaywall(entitlement.reason);
        track(TELEMETRY_EVENT.PAYWALL_SHOW, {
          reason: entitlement.reason,
          from: 'index_start'
        });
        safeNavigateTo(`/pages/paywall/paywall?reason=${entitlement.reason}&returnTo=game`);
        return;
      }

      safeNavigateTo('/pages/game/game');
    },
    goRank() {
      if (!this.ensureLogin('/pages/rank/rank')) return;
      safeNavigateTo('/pages/rank/rank');
    },
    goProfile() {
      if (!this.ensureLogin('/pages/profile/profile')) return;
      safeNavigateTo('/pages/profile/profile');
    }
  }
};
</script>

<style lang="scss" scoped>
.home-page {
  background: #050806;
}

.diff-hotspot {
  left: 48rpx;
  top: 728rpx;
  width: 654rpx;
  height: 108rpx;
}

.library-hotspot {
  left: 48rpx;
  top: 846rpx;
  width: 654rpx;
  height: 108rpx;
}

.start-hotspot {
  left: 48rpx;
  top: 984rpx;
  width: 654rpx;
  height: 120rpx;
  border-radius: 60rpx;
}

.rank-hotspot {
  left: 34rpx;
  top: 1488rpx;
  width: 120rpx;
  height: 110rpx;
}

.profile-hotspot {
  left: 300rpx;
  top: 1488rpx;
  width: 160rpx;
  height: 110rpx;
}

.overlay-text {
  position: absolute;
  color: #e8ffe8;
  pointer-events: none;
}

.score-value {
  right: 82rpx;
  top: 596rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.vocab-value {
  left: 95rpx;
  top: 596rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.quota-value {
  right: 62rpx;
  top: 1149rpx;
  font-size: 22rpx;
  color: #9cad9f;
}

.dataset-value {
  right: 70rpx;
  top: 878rpx;
  font-size: 24rpx;
}

.diff-value {
  right: 70rpx;
  top: 761rpx;
  font-size: 24rpx;
}

.vip-value {
  right: 80rpx;
  top: 645rpx;
  font-size: 20rpx;
  color: #73e6a4;
}

.quota-track {
  position: absolute;
  left: 72rpx;
  top: 1236rpx;
  width: 606rpx;
  height: 12rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background: rgba(40, 46, 42, 0.9);
  pointer-events: none;
  z-index: 1;
}

.quota-progress {
  height: 100%;
  background: linear-gradient(90deg, #1edc74, #65f3aa);
  pointer-events: none;
}
</style>

