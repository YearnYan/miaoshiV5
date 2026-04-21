<template>
  <view class="pixel-screen result-page">
    <image class="pixel-bg" src="/static/ui/r9OdK.png" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot close-hotspot" @click="backHome" />
      <view class="pixel-hotspot retry-hotspot" @click="retryRound" />
      <view class="pixel-hotspot share-hotspot" @click="sharePoster" />
      <view class="pixel-hotspot home-hotspot" @click="backHome" />

      <view class="overlay-text grade-value mono">{{ store.result.grade }}</view>
      <view class="overlay-text score-value mono">{{ store.result.finalScore }}</view>
      <view class="overlay-text max-combo mono">{{ store.result.maxCombo }}</view>
      <view class="overlay-text acc-value mono">{{ store.result.accuracy }}%</view>
      <view class="overlay-text new-words mono">{{ store.result.newWords }}</view>
      <view class="overlay-text avg-response mono">{{ store.result.avgResponseSec }}s</view>
      <view class="overlay-text rank-friend">
        #{{ store.result.rank.friend.rank }} / {{ store.result.rank.friend.total }}
      </view>
      <view class="overlay-text rank-world">
        ³¬¹ý {{ store.result.rank.world.percentile }}% ÓÃ»§
      </view>
      <view class="overlay-text rank-title">{{ store.result.rank.world.title }}</view>
    </view>
  </view>
</template>

<script>
import { safeNavigateTo, safeReLaunch, safeRedirectTo } from '@/common/nav.js';
import { store } from '@/common/store.js';

export default {
  data() {
    return {
      store
    };
  },
  methods: {
    retryRound() {
      safeRedirectTo('/pages/game/game');
    },
    sharePoster() {
      safeNavigateTo('/pages/share-poster/share-poster?from=result');
    },
    backHome() {
      safeReLaunch('/pages/index/index');
    }
  }
};
</script>

<style lang="scss" scoped>
.result-page {
  background: #050806;
}

.close-hotspot {
  right: 30rpx;
  top: 104rpx;
  width: 86rpx;
  height: 86rpx;
}

.retry-hotspot {
  left: 48rpx;
  top: 1194rpx;
  width: 654rpx;
  height: 108rpx;
  border-radius: 54rpx;
}

.share-hotspot {
  left: 48rpx;
  top: 1328rpx;
  width: 314rpx;
  height: 92rpx;
}

.home-hotspot {
  right: 48rpx;
  top: 1328rpx;
  width: 314rpx;
  height: 92rpx;
}

.overlay-text {
  position: absolute;
  pointer-events: none;
  color: #e8ffe8;
}

.grade-value {
  left: 0;
  top: 278rpx;
  width: 750rpx;
  text-align: center;
  font-size: 80rpx;
  font-weight: 700;
  color: #1edc74;
}

.score-value {
  left: 0;
  top: 380rpx;
  width: 750rpx;
  text-align: center;
  font-size: 64rpx;
  font-weight: 700;
}

.max-combo,
.acc-value,
.new-words,
.avg-response {
  font-size: 40rpx;
  font-weight: 700;
}

.max-combo {
  left: 152rpx;
  top: 686rpx;
}

.acc-value {
  left: 486rpx;
  top: 686rpx;
}

.new-words {
  left: 152rpx;
  top: 812rpx;
}

.avg-response {
  left: 486rpx;
  top: 812rpx;
}

.rank-friend,
.rank-world,
.rank-title {
  left: 90rpx;
  width: 570rpx;
  font-size: 26rpx;
  color: #a2b0a7;
}

.rank-friend {
  top: 966rpx;
}

.rank-world {
  top: 1010rpx;
}

.rank-title {
  top: 1054rpx;
  color: #1edc74;
}
</style>


