<template>
  <view class="pixel-screen wrongbook-page">
    <image class="pixel-bg" src="/static/ui/Gtcsb.png" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot back-hotspot" @click="goBack" />
      <view class="pixel-hotspot review-hotspot" @click="startReview" />
      <view class="pixel-hotspot filter1-hotspot" @click="selectFilter('all')" />
      <view class="pixel-hotspot filter2-hotspot" @click="selectFilter('recent')" />
      <view class="pixel-hotspot filter3-hotspot" @click="selectFilter('hard')" />
      <view
        v-for="(item, index) in shownList"
        :key="item.word + '_tap' + index"
        class="pixel-hotspot card-hotspot"
        :style="cardStyle(index)"
        @click="openDetail(item)"
      />

      <view v-for="(item, index) in shownList" :key="item.word + index" class="overlay-card" :style="cardStyle(index)">
        <text class="card-word mono">{{ item.word }}</text>
        <text class="card-def">{{ item.definition }}</text>
        <text class="card-meta">错 {{ item.wrongCount }} 次 · {{ item.lastWrongDate }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { safeBack, safeNavigateTo, safeRedirectTo } from '@/common/nav.js';
import { listWrongbook } from '@/common/wrongbook.js';

export default {
  data() {
    return {
      list: [],
      filter: 'all'
    };
  },
  onShow() {
    this.list = listWrongbook();
  },
  computed: {
    shownList() {
      if (this.filter === 'hard') {
        return [...this.list].sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 3);
      }
      if (this.filter === 'recent') {
        return [...this.list]
          .sort((a, b) => new Date(b.lastWrongDate).getTime() - new Date(a.lastWrongDate).getTime())
          .slice(0, 3);
      }
      return this.list.slice(0, 3);
    }
  },
  methods: {
    cardStyle(index) {
      const top = 716 + index * 156;
      return {
        top: `${top}rpx`
      };
    },
    goBack() {
      safeBack();
    },
    startReview() {
      if (!this.shownList.length) {
        uni.showToast({
          title: '暂无错题可复习',
          icon: 'none'
        });
        return;
      }
      const first = this.shownList[0];
      safeRedirectTo(`/pages/wrongbook-detail/wrongbook-detail?word=${encodeURIComponent(first.word)}&mode=review`);
    },
    selectFilter(type) {
      this.filter = type;
      uni.showToast({
        title: type === 'hard' ? '已切换高频错题' : type === 'recent' ? '已切换最近错题' : '已展示全部错题',
        icon: 'none'
      });
    },
    openDetail(item) {
      safeNavigateTo(`/pages/wrongbook-detail/wrongbook-detail?word=${encodeURIComponent(item.word)}`);
    }
  }
};
</script>

<style lang="scss" scoped>
.wrongbook-page {
  background: #050806;
}

.back-hotspot {
  left: 22rpx;
  top: 102rpx;
  width: 90rpx;
  height: 90rpx;
}

.review-hotspot {
  right: 64rpx;
  top: 312rpx;
  width: 178rpx;
  height: 66rpx;
}

.filter1-hotspot,
.filter2-hotspot,
.filter3-hotspot {
  top: 470rpx;
  width: 170rpx;
  height: 64rpx;
}

.filter1-hotspot {
  left: 48rpx;
}

.filter2-hotspot {
  left: 290rpx;
}

.filter3-hotspot {
  right: 48rpx;
}

.card-hotspot {
  left: 74rpx;
  width: 602rpx;
  height: 132rpx;
}

.overlay-card {
  position: absolute;
  left: 74rpx;
  width: 602rpx;
  height: 132rpx;
  pointer-events: none;
}

.card-word {
  display: block;
  font-size: 34rpx;
  color: #e8ffe8;
  font-weight: 700;
}

.card-def {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #cad8cf;
}

.card-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #92a39a;
}
</style>




