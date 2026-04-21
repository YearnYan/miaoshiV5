<template>
  <scroll-view class="detail-page" scroll-y>
    <view class="detail-header">
      <view class="detail-back" @click="goBack">返回</view>
      <view class="detail-title">错题详情</view>
    </view>

    <view class="detail-content">
      <view class="word">{{ item.word }}</view>
      <view class="definition">{{ item.definition }}</view>
      <view class="meta">错误次数：{{ item.wrongCount }}</view>
      <view class="meta">最近错误：{{ item.lastWrongDate }}</view>
      <view class="meta">所属词库：{{ item.datasetKey }}</view>

      <view class="btn" @click="markReviewed">标记已复习</view>
      <view class="btn secondary" @click="startQuiz">立即测验</view>
    </view>
  </scroll-view>
</template>

<script>
import { safeBack, safeNavigateTo } from '@/common/nav.js';
import { getWrongbookItem, listWrongbook, markWrongReviewed } from '@/common/wrongbook.js';

export default {
  data() {
    return {
      item: {
        word: '-',
        definition: '-',
        wrongCount: 0,
        lastWrongDate: '-',
        datasetKey: '-'
      },
      mode: 'detail'
    };
  },
  onLoad(query) {
    this.mode = query.mode || 'detail';
    const word = query.word ? decodeURIComponent(query.word) : '';
    const datasetKey = query.dataset ? decodeURIComponent(query.dataset) : '';
    const hit = getWrongbookItem(datasetKey, word) || listWrongbook()[0];
    if (hit) {
      this.item = hit;
    }
  },
  methods: {
    goBack() {
      safeBack();
    },
    markReviewed() {
      const reviewed = markWrongReviewed(this.item.datasetKey, this.item.word);
      uni.showToast({
        title: reviewed ? '已标记为已复习' : '记录不存在，已忽略',
        icon: 'none'
      });
      if (this.mode === 'review') {
        setTimeout(() => {
          safeNavigateTo('/pages/game/game');
        }, 260);
      }
    },
    startQuiz() {
      safeNavigateTo('/pages/game/game');
    }
  }
};
</script>

<style lang="scss" scoped>
.detail-page {
  height: 100vh;
  background: #050806;
  color: #e8ffe8;
}

.detail-header {
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}

.detail-back {
  position: absolute;
  left: 28rpx;
  top: 34rpx;
  font-size: 28rpx;
  color: #9eaba2;
}

.detail-title {
  font-size: 32rpx;
  font-weight: 700;
}

.detail-content {
  padding: 28rpx;
}

.word {
  font-size: 56rpx;
  font-weight: 700;
  margin-top: 30rpx;
}

.definition {
  margin-top: 24rpx;
  font-size: 32rpx;
  line-height: 50rpx;
  color: #d9e7de;
}

.meta {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #9eaba2;
}

.btn {
  margin-top: 36rpx;
  height: 88rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 700;
  background: #1edc74;
  color: #0e2516;
}

.btn.secondary {
  margin-top: 18rpx;
  background: rgba(255, 255, 255, 0.12);
  color: #e8ffe8;
}
</style>



