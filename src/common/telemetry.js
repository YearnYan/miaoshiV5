import { apiTelemetryBatch } from './api.js';
import { appendOfflineEvents, clearOfflineEvents, store } from './store.js';

const MAX_BATCH = 20;

export function track(event, payload = {}) {
  const data = {
    event,
    payload,
    clientTs: Date.now(),
    uid: store.user.uid || null
  };
  appendOfflineEvents(data);
}

export async function flushTelemetry() {
  if (!store.offlineEvents.length) return;
  const batch = store.offlineEvents.slice(0, MAX_BATCH);
  try {
    await apiTelemetryBatch({
      events: batch
    });
    clearOfflineEvents(batch.length);
  } catch (error) {
    // 保留待下次补偿
  }
}
