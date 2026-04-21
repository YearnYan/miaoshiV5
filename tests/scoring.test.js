const test = require('node:test');
const assert = require('node:assert/strict');

test('calculateScoreDelta 按公式计算分值', async () => {
  const { calculateScoreDelta } = await import('../src/common/scoring.js');

  const value = calculateScoreDelta({
    correct: true,
    combo: 3,
    level: 2,
    difficulty: 'pro'
  });
  // (100 + 3*8 + 2*5) * 1.3 = 174.2 => 174
  assert.equal(value, 174);

  const wrong = calculateScoreDelta({
    correct: false,
    combo: 0,
    level: 2,
    difficulty: 'pro'
  });
  // (0 + 0 + 2*5) * 1.3 = 13
  assert.equal(wrong, 13);
});

test('gradeByScore 返回正确评级', async () => {
  const { gradeByScore } = await import('../src/common/scoring.js');
  assert.equal(gradeByScore(9200), '超神');
  assert.equal(gradeByScore(7600), 'S');
  assert.equal(gradeByScore(5200), 'A');
  assert.equal(gradeByScore(3200), 'B');
  assert.equal(gradeByScore(1200), 'C');
});

test('calculateRoundSummary 汇总正确率、连击和新增词汇', async () => {
  const { calculateRoundSummary } = await import('../src/common/scoring.js');
  const summary = calculateRoundSummary(
    [
      {
        word: 'perseverance',
        correct: true,
        level: 3,
        responseMs: 1200,
        firstCorrect: true
      },
      {
        word: 'perseverance',
        correct: true,
        level: 3,
        responseMs: 900,
        firstCorrect: false
      },
      {
        word: 'ubiquitous',
        correct: false,
        level: 4,
        responseMs: 5000
      }
    ],
    'fast'
  );

  assert.equal(summary.answerCount, 3);
  assert.equal(summary.correctCount, 2);
  assert.equal(summary.newWords, 1);
  assert.equal(summary.maxCombo, 2);
  assert.equal(summary.accuracy, 67);
  assert.equal(summary.wrongAdded, 1);
  assert.equal(summary.avgResponseSec, 2.37);
  assert.ok(summary.finalScore > 0);
});
