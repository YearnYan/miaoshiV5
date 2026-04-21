<script>
import { initializeApp } from './common/bootstrap';

export default {
  onLaunch() {
    initializeApp();
  },
  onShow() {},
  onHide() {}
};
</script>

<style lang="scss">
@import './uni.scss';

page {
  background: var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-sans);
}

.app-shell {
  min-height: 100vh;
  background: var(--bg-main);
}

.content-padding {
  padding: 0 30rpx;
}

.panel {
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 24rpx;
}

.mono {
  font-family: var(--font-mono);
}

.muted {
  color: var(--text-secondary);
}

.danger {
  color: var(--state-danger);
}

.warning {
  color: var(--state-warning);
}

.success {
  color: var(--accent-main);
}

/* 设计稿严格模式：隐藏运行时文字叠层，避免和底图文字重叠 */
.overlay-text,
.overlay-row {
  display: none !important;
}
</style>
