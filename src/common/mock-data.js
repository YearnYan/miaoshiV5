import words from '@/static/data/dictionary.json';

export const mockDictionary = words;

export const mockFriendRanks = [
  { uid: 'u1', rank: 1, nickname: '暗影·领跑者', vocabCount: 5280, score: 9820, badge: '大师' },
  { uid: 'u2', rank: 2, nickname: '阿尔法', vocabCount: 4320, score: 9320, badge: '进阶' },
  { uid: 'u3', rank: 3, nickname: '凯莉', vocabCount: 3980, score: 8950, badge: '进阶' },
  { uid: 'u4', rank: 4, nickname: '字母密码', vocabCount: 3280, score: 7120, badge: '熟练' },
  { uid: 'u5', rank: 5, nickname: '月光·脉冲', vocabCount: 2540, score: 6890, badge: '进阶' },
  { uid: 'u_me', rank: 12, nickname: '你 · YEARN', vocabCount: 1248, score: 5420, badge: '进阶', me: true },
  { uid: 'u6', rank: 13, nickname: '回声', vocabCount: 1080, score: 5210, badge: '进阶' }
];

export const mockWorldRanks = [
  { uid: 'w1', rank: 1, nickname: '神速闪词', vocabCount: 12480, score: 18920, badge: '传奇' },
  { uid: 'w2', rank: 2, nickname: '闪电君', vocabCount: 11280, score: 17420, badge: '大师' },
  { uid: 'w3', rank: 3, nickname: '新星', vocabCount: 10120, score: 16580, badge: '大师' },
  { uid: 'w4', rank: 4, nickname: '折映', vocabCount: 9810, score: 15860, badge: '大师' },
  { uid: 'w5', rank: 5, nickname: '极光', vocabCount: 9200, score: 15120, badge: '大师' },
  { uid: 'u_me', rank: 1248, nickname: '你 · YEARN', vocabCount: 1248, score: 5420, badge: '进阶', me: true }
];

export const mockWrongbook = [
  {
    word: 'perseverance',
    definition: 'n. 坚持不懈，毅力',
    wrongCount: 3,
    lastWrongDate: '2026-04-20',
    datasetKey: 'cet6'
  },
  {
    word: 'ubiquitous',
    definition: 'adj. 无处不在的，普遍存在的',
    wrongCount: 2,
    lastWrongDate: '2026-04-19',
    datasetKey: 'cet6'
  },
  {
    word: 'ephemeral',
    definition: 'adj. 短暂的，瞬息的',
    wrongCount: 2,
    lastWrongDate: '2026-04-18',
    datasetKey: 'cet6'
  }
];
