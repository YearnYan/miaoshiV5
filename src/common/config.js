export const APP_VERSION = '2.0.0';
export const FREE_LIMIT = 100;
export const ROUND_TOTAL_QUESTIONS = 50;
export const ANSWER_TIMEOUT_MS = 5000;
export const FEEDBACK_STAY_MS = 800;
export const ROUND_MAX_DURATION_MS = 10 * 60 * 1000;

export const DIFFICULTIES = {
  godlike: {
    key: 'godlike',
    label: '极限档',
    exposureMs: 30,
    factor: 1.6,
    shortLabel: '极限'
  },
  pro: {
    key: 'pro',
    label: '进阶档',
    exposureMs: 80,
    factor: 1.3,
    shortLabel: '进阶'
  },
  fast: {
    key: 'fast',
    label: '快速档',
    exposureMs: 150,
    factor: 1.1,
    shortLabel: '快速'
  },
  rookie: {
    key: 'rookie',
    label: '新手档',
    exposureMs: 300,
    factor: 1,
    shortLabel: '新手'
  }
};

export const DEFAULT_DIFFICULTY = 'godlike';
export const DEFAULT_DATASET = 'cet6';

export const DATASETS = [
  { key: 'cet6', name: '大学英语六级', total: 5538, tier: '进行中', locked: false },
  { key: 'senior', name: '中高考核心', total: 3518, tier: '基础覆盖', locked: false },
  { key: 'cet4', name: '大学英语四级', total: 4538, tier: '高频词', locked: false },
  { key: 'kaoyan', name: '考研核心', total: 5500, tier: '会员词库', locked: true },
  { key: 'ielts', name: '雅思词汇', total: 7800, tier: '会员词库', locked: true },
  { key: 'gre', name: '美研词汇', total: 10200, tier: '会员词库', locked: true }
];

export const PRODUCTS = {
  month: {
    type: 'month',
    label: '月卡',
    amountFen: 990,
    amountLabel: '¥9.9',
    description: '30 天全量词库 · 无限挑战'
  },
  lifetime: {
    type: 'lifetime',
    label: '终身卡',
    amountFen: 2990,
    amountLabel: '¥29.9',
    description: '永久可用 · 一次买断'
  }
};

export const TELEMETRY_EVENT = {
  LOGIN_SUCCESS: 'login_success',
  GAME_START: 'game_start',
  FLASH_ANSWER: 'flash_answer',
  ROUND_FINISH: 'round_finish',
  PAYWALL_SHOW: 'paywall_show',
  PAY_CLICK: 'pay_click',
  PAY_SUCCESS: 'pay_success',
  INVITE_SEND: 'invite_send',
  INVITE_SUCCESS: 'invite_success',
  RANK_VIEW: 'rank_view'
};

export const CLOUD_FN = {
  CHECK_AUTH: 'fb-check-auth',
  GET_WORDS: 'fb-get-words',
  SUBMIT_ROUND: 'fb-submit-round',
  RANK_QUERY: 'fb-rank-query',
  CREATE_ORDER: 'fb-create-order',
  PAY_NOTIFY: 'fb-pay-notify',
  INVITE_REWARD: 'fb-invite-reward',
  TELEMETRY_BATCH: 'fb-telemetry-batch'
};
