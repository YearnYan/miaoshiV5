<template>
  <view class="search-page">
    <view class="search-header">
      <view class="search-back" @click="goBack">∑µªÿ</view>
      <view class="search-title">¥ ø‚À—À˜</view>
    </view>

    <view class="search-bar-wrap">
      <input
        v-model="keyword"
        class="search-input"
        placeholder=" ‰»Î¥ ø‚πÿº¸¥ "
        placeholder-class="ph"
        @input="onInput"
      />
    </view>

    <scroll-view class="search-list" scroll-y>
      <view v-if="!filtered.length" class="empty">Œ¥’“µΩ∆•≈‰¥ ø‚</view>
      <view v-for="item in filtered" :key="item.key" class="dataset-item" @click="pick(item)">
        <view class="dataset-name">{{ item.name }}</view>
        <view class="dataset-meta">{{ item.total }}¥  °§ {{ item.tier }}</view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { DATASETS } from '@/common/config.js';
import { safeBack } from '@/common/nav.js';
import { updateDataset } from '@/common/store.js';

export default {
  data() {
    return {
      keyword: '',
      filtered: DATASETS
    };
  },
  methods: {
    goBack() {
      safeBack();
    },
    onInput(e) {
      const value = e.detail.value || '';
      this.keyword = value;
      const key = value.trim().toLowerCase();
      if (!key) {
        this.filtered = DATASETS;
        return;
      }
      this.filtered = DATASETS.filter((item) => item.name.toLowerCase().includes(key) || item.key.includes(key));
    },
    pick(item) {
      updateDataset(item.key);
      uni.showToast({
        title: `“—«–ªªµΩ${item.name}`,
        icon: 'none'
      });
      setTimeout(() => {
        safeBack();
      }, 220);
    }
  }
};
</script>

<style lang="scss" scoped>
.search-page {
  height: 100vh;
  background: #050806;
  color: #e8ffe8;
}

.search-header {
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}

.search-back {
  position: absolute;
  left: 28rpx;
  top: 34rpx;
  font-size: 28rpx;
  color: #9eaba2;
}

.search-title {
  font-size: 32rpx;
  font-weight: 700;
}

.search-bar-wrap {
  padding: 24rpx;
}

.search-input {
  height: 84rpx;
  border-radius: 14rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  padding: 0 24rpx;
  color: #e8ffe8;
  background: rgba(255, 255, 255, 0.04);
}

.ph {
  color: #7f8a84;
}

.search-list {
  height: calc(100vh - 216rpx);
  padding: 0 24rpx 24rpx;
}

.empty {
  margin-top: 80rpx;
  text-align: center;
  color: #9eaba2;
  font-size: 28rpx;
}

.dataset-item {
  margin-bottom: 18rpx;
  padding: 22rpx;
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.dataset-name {
  font-size: 30rpx;
  font-weight: 700;
}

.dataset-meta {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #9eaba2;
}
</style>


