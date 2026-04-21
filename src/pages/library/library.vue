<template>
  <view class="pixel-screen library-page">
    <image class="pixel-bg" src="/static/ui/lBdVl.png" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot back-hotspot" @click="goBack" />
      <view class="pixel-hotspot search-hotspot" @click="showSearchHint" />

      <view
        v-for="(item, index) in datasets"
        :key="item.key"
        class="pixel-hotspot dataset-hotspot"
        :style="datasetHotspotStyle(index)"
        @click="selectDataset(item)"
      />

      <view
        v-for="(item, index) in datasets"
        :key="item.key + '_name'"
        class="overlay-text dataset-name"
        :style="datasetNameStyle(index)"
      >
        {{ item.name }}
      </view>

      <view
        v-for="(item, index) in datasets"
        :key="item.key + '_meta'"
        class="overlay-text dataset-meta"
        :style="datasetMetaStyle(index)"
      >
        {{ item.total }} 词 · {{ item.tier }}
      </view>

      <view
        v-for="(item, index) in datasets"
        :key="item.key + '_tag'"
        class="overlay-text dataset-tag"
        :class="tagClass(item.key)"
        :style="datasetTagStyle(index)"
      >
        {{ tagText(item.key) }}
      </view>
    </view>
  </view>
</template>

<script>
import { DATASETS } from '@/common/config.js';
import { isDatasetLocked } from '@/common/entitlement.js';
import { safeBack, safeNavigateTo } from '@/common/nav.js';
import { store, updateDataset } from '@/common/store.js';

export default {
  data() {
    return {
      store,
      datasets: DATASETS
    };
  },
  methods: {
    goBack() {
      safeBack();
    },
    showSearchHint() {
      safeNavigateTo('/pages/library-search/library-search');
    },
    isCurrent(datasetKey) {
      return this.store.game.datasetKey === datasetKey;
    },
    isLocked(datasetKey) {
      return isDatasetLocked(datasetKey, this.store.user);
    },
    tagText(datasetKey) {
      if (this.isCurrent(datasetKey)) return '当前';
      if (this.isLocked(datasetKey)) return '已锁定';
      return '可用';
    },
    tagClass(datasetKey) {
      if (this.isCurrent(datasetKey)) return 'tag-current';
      if (this.isLocked(datasetKey)) return 'tag-locked';
      return 'tag-open';
    },
    datasetHotspotStyle(index) {
      const top = 334 + index * 132;
      return {
        top: `${top}rpx`
      };
    },
    datasetNameStyle(index) {
      const top = 360 + index * 132;
      return {
        top: `${top}rpx`
      };
    },
    datasetMetaStyle(index) {
      const top = 398 + index * 132;
      return {
        top: `${top}rpx`
      };
    },
    datasetTagStyle(index) {
      const top = 362 + index * 132;
      return {
        top: `${top}rpx`
      };
    },
    selectDataset(item) {
      if (this.isLocked(item.key)) {
        safeNavigateTo(`/pages/paywall/paywall?reason=dataset_locked&dataset=${item.key}`);
        return;
      }
      updateDataset(item.key);
      uni.showToast({
        title: `已切换到${item.name}`,
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
.library-page {
  background: #050806;
}

.back-hotspot {
  left: 22rpx;
  top: 100rpx;
  width: 90rpx;
  height: 90rpx;
}

.search-hotspot {
  left: 48rpx;
  top: 238rpx;
  width: 654rpx;
  height: 86rpx;
}

.dataset-hotspot {
  left: 48rpx;
  width: 654rpx;
  height: 116rpx;
}

.overlay-text {
  position: absolute;
  pointer-events: none;
  color: #e8ffe8;
}

.dataset-name {
  left: 80rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.dataset-meta {
  left: 80rpx;
  font-size: 22rpx;
  color: #96a69c;
}

.dataset-tag {
  right: 84rpx;
  width: 98rpx;
  height: 42rpx;
  line-height: 42rpx;
  text-align: center;
  border-radius: 24rpx;
  font-size: 20rpx;
}

.tag-current {
  background: rgba(30, 220, 116, 0.2);
  color: #1edc74;
}

.tag-open {
  background: rgba(74, 132, 255, 0.2);
  color: #8eb5ff;
}

.tag-locked {
  background: rgba(245, 166, 35, 0.2);
  color: #f5a623;
}
</style>


