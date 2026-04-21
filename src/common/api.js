import { CLOUD_FN } from './config.js';

function hasUniCloud() {
  return typeof uniCloud !== 'undefined' && typeof uniCloud.callFunction === 'function';
}

export async function callCloud(name, data = {}) {
  if (!hasUniCloud()) {
    throw new Error(`uniCloud 不可用: ${name}`);
  }
  const res = await uniCloud.callFunction({
    name,
    data
  });
  const result = res?.result;
  if (!result) {
    throw new Error(`${name} 无返回结果`);
  }
  if (result.code && result.code !== 0) {
    throw new Error(result.message || `${name} 调用失败`);
  }
  return result;
}

export async function apiCheckAuth() {
  return callCloud(CLOUD_FN.CHECK_AUTH, {});
}

export async function apiGetWords(payload) {
  return callCloud(CLOUD_FN.GET_WORDS, payload);
}

export async function apiSubmitRound(payload) {
  return callCloud(CLOUD_FN.SUBMIT_ROUND, payload);
}

export async function apiRankQuery(payload) {
  return callCloud(CLOUD_FN.RANK_QUERY, payload);
}

export async function apiCreateOrder(payload) {
  return callCloud(CLOUD_FN.CREATE_ORDER, payload);
}

export async function apiPayNotify(payload) {
  return callCloud(CLOUD_FN.PAY_NOTIFY, payload);
}

export async function apiInviteReward(payload) {
  return callCloud(CLOUD_FN.INVITE_REWARD, payload);
}

export async function apiTelemetryBatch(payload) {
  return callCloud(CLOUD_FN.TELEMETRY_BATCH, payload);
}
