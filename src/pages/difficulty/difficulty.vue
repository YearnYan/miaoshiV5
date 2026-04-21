<template>
  <view class="pixel-screen page-wrap">
    <image class="pixel-bg" src="/static/ui/5IaqR.png" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot back-hotspot" @click="goBack" />
      <view
        v-for="(item, index) in list"
        :key="item.key"
        class="pixel-hotspot item-hotspot"
        :style="itemStyle(index)"
        @click="select(item.key)"
      />
      <view class="pixel-hotspot confirm-hotspot" @click="confirm" />

      <view class="overlay-text current-text">当前难度：{{ currentLabel }}</view>
      <view class="overlay-text hint-text">切换后下局立即生效</view>
    </view>
  </view>
</template>

<script>
import { DIFFICULTIES } from '@/common/config.js';
import { safeBack } from '@/common/nav.js';
import { store, updateDifficulty } from '@/common/store.js';

export default {
  data() {
    return {
      selected: store.game.difficulty,
      list: Object.values(DIFFICULTIES)
    };
  },
  computed: {
    currentLabel() {
      return DIFFICULTIES[this.selected]?.label || '极限档';
    }
  },
  methods: {
    itemStyle(index) {
      return {
        left: '48rpx',
        top: `${548 + index * 128}rpx`,
        width: '654rpx',
        height: '98rpx'
      };
    },
    select(key) {
      this.selected = key;
      uni.showToast({
        title: `已选择${DIFFICULTIES[key].label}`,
        icon: 'none'
      });
    },
    confirm() {
      updateDifficulty(this.selected);
      uni.showToast({
        title: `难度已切换为${DIFFICULTIES[this.selected].label}`,
        icon: 'none'
      });
      setTimeout(() => {
        safeBack();
      }, 220);
    },
    goBack() {
      safeBack();
    }
  }
};
</script>

<style lang="scss" scoped>
.page-wrap {
  background: #050806;
}

.back-hotspot {
  left: 26rpx;
  top: 96rpx;
  width: 90rpx;
  height: 90rpx;
}

.confirm-hotspot {
  left: 48rpx;
  top: 1242rpx;
  width: 654rpx;
  height: 96rpx;
}

.overlay-text {
  position: absolute;
  pointer-events: none;
  color: #e8ffe8;
}

.current-text {
  left: 0;
  top: 274rpx;
  width: 750rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
}

.hint-text {
  left: 0;
  top: 326rpx;
  width: 750rpx;
  text-align: center;
  font-size: 22rpx;
  color: #9eaba2;
}
</style>


