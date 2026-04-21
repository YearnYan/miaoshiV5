import { checkAuth, syncOfflineRounds } from './service.js';
import { flushTelemetry } from './telemetry.js';
import { store } from './store.js';

const UI_SCHEMA_VERSION_KEY = 'fb_ui_schema_version';
const UI_SCHEMA_VERSION = 'v3_pixel_lock';

function migrateLocalStorageForUi() {
  try {
    const current = uni.getStorageSync(UI_SCHEMA_VERSION_KEY);
    if (current === UI_SCHEMA_VERSION) return;

    const keys = uni.getStorageInfoSync()?.keys || [];
    keys
      .filter((key) => typeof key === 'string' && key.startsWith('fb_'))
      .forEach((key) => {
        uni.removeStorageSync(key);
      });

    uni.setStorageSync(UI_SCHEMA_VERSION_KEY, UI_SCHEMA_VERSION);
    console.log('[bootstrap] 已清理旧版本地缓存，启用像素锁定 UI');
  } catch (error) {
    console.warn('[bootstrap] 本地缓存迁移失败', error);
  }
}

export async function initializeApp() {
  if (store.appReady) return;
  store.appReady = true;
  migrateLocalStorageForUi();

  try {
    await checkAuth();
  } catch (error) {
    console.warn('[bootstrap] 登录态校验失败', error);
  }

  try {
    await syncOfflineRounds();
  } catch (error) {
    console.warn('[bootstrap] 离线成绩补偿失败', error);
  }

  try {
    await flushTelemetry();
  } catch (error) {
    console.warn('[bootstrap] 埋点补偿失败', error);
  }
}
