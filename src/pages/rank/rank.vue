<template>
  <view class="pixel-screen rank-page">
    <image class="pixel-bg" :src="rankBg" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot back-hotspot" @click="goBack" />
      <view class="pixel-hotspot tab-friend-hotspot" @click="switchTab('friend')" />
      <view class="pixel-hotspot tab-world-hotspot" @click="switchTab('world')" />
      <view class="pixel-hotspot refresh-hotspot" @click="refreshCurrent" />
      <view class="pixel-hotspot share-hotspot" @click="inviteFriend" />

      <view v-if="loading" class="loading-mask">
        <text class="loading-text">排行榜加载中...</text>
      </view>

      <view v-if="errorText" class="overlay-text error-text">{{ errorText }}</view>
      <view v-if="!loading && !shownList.length" class="overlay-text empty-text">暂无排行数据，点击刷新重试</view>

      <view v-for="(item, index) in shownList" :key="item.uid + '_' + index" class="overlay-row" :style="rowStyle(index)">
        <text class="row-rank mono" :class="{ top: item.rank <= 3 }">#{{ item.rank }}</text>
        <text class="row-name">{{ item.nickname }}</text>
        <text class="row-score mono">{{ item.score }}</text>
      </view>

      <view v-if="tab === 'world' && meItem" class="overlay-text world-me-rank">第 {{ meItem.rank }} 名</view>
    </view>
  </view>
</template>

<script>
import { TELEMETRY_EVENT } from '@/common/config.js';
import { safeBack, safeNavigateTo } from '@/common/nav.js';
import { queryRank } from '@/common/service.js';
import { track } from '@/common/telemetry.js';

export default {
  data() {
    return {
      tab: 'friend',
      loading: false,
      friendList: [],
      worldList: [],
      errorText: ''
    };
  },
  computed: {
    rankBg() {
      return this.tab === 'world' ? '/static/ui/827LW.png' : '/static/ui/bwMjn.png';
    },
    rankList() {
      return this.tab === 'friend' ? this.friendList : this.worldList;
    },
    shownList() {
      return this.rankList.slice(0, 6);
    },
    meItem() {
      return this.rankList.find((item) => item.uid === 'me') || this.rankList[0] || null;
    }
  },
  onLoad() {
    this.fetchRank('friend');
  },
  methods: {
    goBack() {
      safeBack(1, '/pages/index/index');
    },
    rowStyle(index) {
      const baseTop = this.tab === 'friend' ? 712 : 580;
      const top = baseTop + index * 96;
      return {
        top: `${top}rpx`
      };
    },
    async fetchRank(type, forceRefresh = false) {
      this.loading = true;
      this.errorText = '';
      try {
        const res = await queryRank(type, 1, 50, {
          forceRefresh
        });
        if (type === 'friend') {
          this.friendList = res.list || [];
        } else {
          this.worldList = res.list || [];
        }
        if (res.stale) {
          this.errorText = '网络异常，已展示缓存榜单';
        } else if (res.cacheHit) {
          this.errorText = '已展示5分钟内缓存';
        }
        track(TELEMETRY_EVENT.RANK_VIEW, {
          type,
          cacheHit: Boolean(res.cacheHit),
          fallback: Boolean(res.fallback)
        });
      } catch (error) {
        this.errorText = '加载失败，请稍后重试';
        uni.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    switchTab(type) {
      if (this.tab === type) return;
      this.tab = type;
      if (!this.rankList.length) {
        this.fetchRank(type);
      }
    },
    refreshCurrent() {
      this.fetchRank(this.tab, true);
    },
    inviteFriend() {
      track(TELEMETRY_EVENT.INVITE_SEND, {
        source: 'rank'
      });
      safeNavigateTo('/pages/share-poster/share-poster?from=rank');
    }
  }
};
</script>

<style lang="scss" scoped>
.rank-page {
  background: #050806;
}

.back-hotspot {
  left: 24rpx;
  top: 102rpx;
  width: 88rpx;
  height: 88rpx;
}

.tab-friend-hotspot,
.tab-world-hotspot {
  top: 234rpx;
  width: 326rpx;
  height: 78rpx;
}

.tab-friend-hotspot {
  left: 48rpx;
}

.tab-world-hotspot {
  right: 48rpx;
}

.refresh-hotspot {
  right: 24rpx;
  top: 102rpx;
  width: 88rpx;
  height: 88rpx;
}

.share-hotspot {
  left: 48rpx;
  top: 1360rpx;
  width: 654rpx;
  height: 98rpx;
  border-radius: 50rpx;
}

.overlay-row {
  position: absolute;
  left: 74rpx;
  width: 602rpx;
  height: 78rpx;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.row-rank {
  width: 100rpx;
  color: #9fb0a5;
  font-size: 26rpx;
}

.row-rank.top {
  color: #f5a623;
}

.row-name {
  width: 320rpx;
  color: #e8ffe8;
  font-size: 26rpx;
}

.row-score {
  width: 182rpx;
  text-align: right;
  color: #1edc74;
  font-size: 30rpx;
  font-weight: 700;
}

.world-me-rank {
  position: absolute;
  right: 84rpx;
  top: 406rpx;
  color: #e8ffe8;
  font-size: 26rpx;
}

.error-text {
  left: 74rpx;
  top: 516rpx;
  width: 602rpx;
  color: #f5a623;
  font-size: 22rpx;
  text-align: center;
}

.empty-text {
  left: 74rpx;
  top: 620rpx;
  width: 602rpx;
  color: #9fb0a5;
  font-size: 24rpx;
  text-align: center;
}

.loading-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  padding: 14rpx 24rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #e8ffe8;
  background: rgba(17, 21, 26, 0.94);
}
</style>
