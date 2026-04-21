import localWords from '@/static/data/dictionary.json';
import { apiGetWords } from './api.js';

const STORAGE_KEY = 'fb_dict_cache_v2';

function defaultStorage() {
  return {
    get(key) {
      try {
        return uni.getStorageSync(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        uni.setStorageSync(key, value);
      } catch (error) {
        // ignore
      }
    }
  };
}

function normalizeWords(words, datasetKey) {
  return (words || [])
    .filter((item) => item.datasetKey === datasetKey)
    .map((item, index) => ({
      id: `${datasetKey}_${index}_${item.word}`,
      datasetKey: item.datasetKey,
      word: item.word,
      definition: item.definition,
      level: item.level || 1,
      phonetic: item.phonetic || '',
      example: item.example || ''
    }));
}

export async function loadWords(datasetKey, options = {}) {
  const storage = options.storage || defaultStorage();
  const forceRefresh = Boolean(options.forceRefresh);
  const cache = storage.get(STORAGE_KEY) || {};
  const datasetCache = cache[datasetKey];

  if (!forceRefresh && datasetCache?.words?.length) {
    return {
      source: 'cache',
      version: datasetCache.version,
      words: datasetCache.words
    };
  }

  try {
    const cloudRes = await apiGetWords({
      datasetKey,
      clientVersion: datasetCache?.version || null
    });

    if (cloudRes?.hasUpdate && cloudRes?.words?.length) {
      const normalized = normalizeWords(cloudRes.words, datasetKey);
      cache[datasetKey] = {
        version: cloudRes.version || Date.now(),
        words: normalized
      };
      storage.set(STORAGE_KEY, cache);
      return {
        source: 'cloud',
        version: cache[datasetKey].version,
        words: normalized
      };
    }

    if (datasetCache?.words?.length) {
      return {
        source: 'cache',
        version: datasetCache.version,
        words: datasetCache.words
      };
    }
  } catch (error) {
    // cloud 不可用时降级本地词库
  }

  const fallbackWords = normalizeWords(localWords, datasetKey);
  cache[datasetKey] = {
    version: datasetCache?.version || 1,
    words: fallbackWords
  };
  storage.set(STORAGE_KEY, cache);
  return {
    source: 'local',
    version: cache[datasetKey].version,
    words: fallbackWords
  };
}

export function shuffleList(list) {
  const clone = [...list];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

export function generateQuestionSet(words, total = 50) {
  if (!words?.length) return [];
  const shuffled = shuffleList(words);
  const result = [];

  while (result.length < total) {
    result.push(shuffled[result.length % shuffled.length]);
  }
  return result;
}

export function buildOptions(targetWord, allWords) {
  const sameLevel = allWords.filter(
    (item) =>
      item.word !== targetWord.word &&
      item.datasetKey === targetWord.datasetKey &&
      Math.abs((item.level || 1) - (targetWord.level || 1)) <= 1
  );

  const candidate = sameLevel.length >= 3 ? sameLevel : allWords.filter((w) => w.word !== targetWord.word);
  const distractors = shuffleList(candidate).slice(0, 3);
  const options = [
    {
      value: targetWord.definition,
      correct: true
    },
    ...distractors.map((item) => ({
      value: item.definition,
      correct: false
    }))
  ];

  return shuffleList(options).map((item, index) => ({
    index: index + 1,
    ...item
  }));
}
