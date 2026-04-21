const WRONGBOOK_KEY = 'fb_wrongbook';

function safeLoad() {
  try {
    const value = uni.getStorageSync(WRONGBOOK_KEY);
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

function safeSave(list) {
  try {
    uni.setStorageSync(WRONGBOOK_KEY, list);
  } catch (error) {
    // 本地缓存失败不阻塞主流程
  }
}

function uniqueKey(item) {
  return `${item.datasetKey || ''}::${item.word || ''}`;
}

function normalizeItem(item = {}) {
  return {
    word: item.word || '',
    definition: item.definition || '',
    datasetKey: item.datasetKey || '',
    wrongCount: Number(item.wrongCount || 0),
    lastWrongDate: item.lastWrongDate || new Date().toISOString().slice(0, 10),
    reviewedAt: Number(item.reviewedAt || 0)
  };
}

export function listWrongbook() {
  return safeLoad().map(normalizeItem);
}

export function getWrongbookItem(datasetKey, word) {
  if (!word) return null;
  return listWrongbook().find((item) => item.word === word && item.datasetKey === datasetKey) || null;
}

export function upsertWrongAnswers(answers = []) {
  if (!Array.isArray(answers) || !answers.length) return listWrongbook();
  const current = listWrongbook();
  const map = new Map(current.map((item) => [uniqueKey(item), item]));
  const today = new Date().toISOString().slice(0, 10);

  answers
    .filter((item) => item && !item.correct && item.word)
    .forEach((item) => {
      const normalized = normalizeItem(item);
      const key = uniqueKey(normalized);
      const prev = map.get(key);
      if (prev) {
        map.set(key, {
          ...prev,
          definition: normalized.definition || prev.definition,
          wrongCount: Number(prev.wrongCount || 0) + 1,
          lastWrongDate: today
        });
        return;
      }
      map.set(key, {
        word: normalized.word,
        definition: normalized.definition,
        datasetKey: normalized.datasetKey,
        wrongCount: 1,
        lastWrongDate: today,
        reviewedAt: 0
      });
    });

  const next = Array.from(map.values()).sort((a, b) => {
    const at = new Date(a.lastWrongDate).getTime() || 0;
    const bt = new Date(b.lastWrongDate).getTime() || 0;
    return bt - at;
  });
  safeSave(next);
  return next;
}

export function markWrongReviewed(datasetKey, word) {
  if (!word) return false;
  const list = listWrongbook();
  let hit = false;
  const next = list.map((item) => {
    if (item.word === word && item.datasetKey === datasetKey) {
      hit = true;
      return {
        ...item,
        reviewedAt: Date.now()
      };
    }
    return item;
  });
  if (hit) {
    safeSave(next);
  }
  return hit;
}

