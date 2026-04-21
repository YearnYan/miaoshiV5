<template>
  <view class="pixel-screen page-wrap">
    <image class="pixel-bg" src="/static/ui/MJBSd.png" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot close-hotspot" @click="close" />
      <view class="pixel-hotspot save-hotspot" @click="savePoster" />
      <view class="pixel-hotspot send-hotspot" @click="shareNow" />

      <view class="overlay-text title-text">本局{{ grade }} · {{ score }}</view>
      <view class="overlay-text sub-text">点击保存海报或直接分享好友</view>
    </view>
  </view>
</template>

<script>
import { safeBack } from '@/common/nav.js';
import { store } from '@/common/store.js';
import { track } from '@/common/telemetry.js';
import { buildSharePayload } from '@/common/share.js';
import { TELEMETRY_EVENT } from '@/common/config.js';

export default {
  onShareAppMessage() {
    return buildSharePayload({
      uid: store.user.uid,
      nickname: store.user.nickname,
      score: store.result.finalScore,
      grade: store.result.grade,
      source: 'poster_message'
    });
  },
  onShareTimeline() {
    const payload = buildSharePayload({
      uid: store.user.uid,
      nickname: store.user.nickname,
      score: store.result.finalScore,
      grade: store.result.grade,
      source: 'poster_timeline'
    });
    return {
      title: payload.title,
      query: payload.path.replace('/pages/index/index?', ''),
      imageUrl: payload.imageUrl
    };
  },
  computed: {
    grade() {
      return store.result.grade || 'A';
    },
    score() {
      return store.result.finalScore || 0;
    }
  },
  methods: {
    close() {
      safeBack(1, '/pages/index/index');
    },
    savePoster() {
      uni.showToast({
        title: '海报已保存到相册（模拟）',
        icon: 'none'
      });
    },
    shareNow() {
      track(TELEMETRY_EVENT.INVITE_SEND, {
        source: 'share_poster'
      });
      uni.showToast({
        title: '请点击右上角转发',
        icon: 'success'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.page-wrap {
  background: #050806;
}

.close-hotspot {
  right: 34rpx;
  top: 108rpx;
  width: 72rpx;
  height: 72rpx;
}

.save-hotspot {
  left: 60rpx;
  top: 1388rpx;
  width: 300rpx;
  height: 92rpx;
}

.send-hotspot {
  right: 60rpx;
  top: 1388rpx;
  width: 300rpx;
  height: 92rpx;
}

.overlay-text {
  position: absolute;
  pointer-events: none;
  color: #e8ffe8;
}

.title-text {
  left: 0;
  top: 400rpx;
  width: 750rpx;
  text-align: center;
  font-size: 36rpx;
  font-weight: 700;
}

.sub-text {
  left: 0;
  top: 458rpx;
  width: 750rpx;
  text-align: center;
  font-size: 22rpx;
  color: #9eaba2;
}
</style>
