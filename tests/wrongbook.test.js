import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const modulePath = pathToFileURL(path.resolve('src/common/wrongbook.js')).href;

function mountUniStorage(seed = {}) {
  const storage = new Map(Object.entries(seed));
  globalThis.uni = {
    getStorageSync(key) {
      return storage.get(key);
    },
    setStorageSync(key, value) {
      storage.set(key, value);
    }
  };
  return storage;
}

test('upsertWrongAnswers 会累加错题并去重', async () => {
  mountUniStorage();
  const mod = await import(`${modulePath}?t=${Date.now()}_1`);
  mod.upsertWrongAnswers([
    { word: 'abandon', definition: '放弃', datasetKey: 'cet4', correct: false },
    { word: 'abandon', definition: '放弃', datasetKey: 'cet4', correct: false },
    { word: 'ability', definition: '能力', datasetKey: 'cet4', correct: true }
  ]);
  const list = mod.listWrongbook();
  assert.equal(list.length, 1);
  assert.equal(list[0].word, 'abandon');
  assert.equal(list[0].wrongCount, 2);
});

test('markWrongReviewed 可标记复习时间', async () => {
  const storage = mountUniStorage({
    fb_wrongbook: [
      {
        word: 'keen',
        definition: '敏锐的',
        datasetKey: 'cet6',
        wrongCount: 3,
        lastWrongDate: '2026-04-21',
        reviewedAt: 0
      }
    ]
  });
  const mod = await import(`${modulePath}?t=${Date.now()}_2`);
  const ok = mod.markWrongReviewed('cet6', 'keen');
  assert.equal(ok, true);
  const saved = storage.get('fb_wrongbook');
  assert.equal(saved[0].reviewedAt > 0, true);
});

