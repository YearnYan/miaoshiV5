const test = require('node:test');
const assert = require('node:assert/strict');

test('shuffleList 保持元素集合不变', async () => {
  const { shuffleList } = await import('../src/common/dict-loader.node.testable.js');
  const list = [1, 2, 3, 4, 5];
  const shuffled = shuffleList(list);
  assert.equal(shuffled.length, 5);
  assert.deepEqual([...shuffled].sort((a, b) => a - b), [1, 2, 3, 4, 5]);
});

test('generateQuestionSet 可补齐目标题量', async () => {
  const { generateQuestionSet } = await import('../src/common/dict-loader.node.testable.js');
  const source = [{ word: 'a' }, { word: 'b' }, { word: 'c' }];
  const result = generateQuestionSet(source, 10);
  assert.equal(result.length, 10);
  assert.ok(result.every((item) => source.includes(item)));
});

test('buildOptions 返回四个选项且包含正确答案', async () => {
  const { buildOptions } = await import('../src/common/dict-loader.node.testable.js');
  const words = [
    { word: 'a', definition: '甲', level: 2, datasetKey: 'cet6' },
    { word: 'b', definition: '乙', level: 2, datasetKey: 'cet6' },
    { word: 'c', definition: '丙', level: 2, datasetKey: 'cet6' },
    { word: 'd', definition: '丁', level: 2, datasetKey: 'cet6' },
    { word: 'e', definition: '戊', level: 2, datasetKey: 'cet6' }
  ];

  const options = buildOptions(words[0], words);
  assert.equal(options.length, 4);
  assert.equal(options.filter((item) => item.correct).length, 1);
  assert.ok(options.some((item) => item.value === '甲' && item.correct));
});
