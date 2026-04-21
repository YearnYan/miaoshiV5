const test = require('node:test');
const assert = require('node:assert/strict');

test('GameEngine 能完成 flash -> input -> feedback 状态流转', async () => {
  const { GameEngine } = await import('../src/common/game-engine.js');
  const phaseList = [];
  let flashDone = false;
  let feedbackDone = false;

  await new Promise((resolve) => {
    const engine = new GameEngine({
      answerTimeoutMs: 120,
      feedbackMs: 80,
      onPhaseChange: (phase) => {
        phaseList.push(phase);
      },
      onFlashEnd: () => {
        flashDone = true;
        engine.startInput();
      },
      onAnswerTimeout: () => {
        engine.startFeedback({
          correct: false
        });
      },
      onFeedbackDone: () => {
        feedbackDone = true;
        engine.finish();
        engine.destroy();
        resolve();
      }
    });

    engine.startFlash(50);
  });

  assert.equal(flashDone, true);
  assert.equal(feedbackDone, true);
  assert.ok(phaseList.includes('flash'));
  assert.ok(phaseList.includes('input'));
  assert.ok(phaseList.includes('feedback'));
  assert.ok(phaseList.includes('finished'));
});

test('GameEngine pause/resume 在输入阶段保持剩余时间', async () => {
  const { GameEngine } = await import('../src/common/game-engine.js');
  let pausedLeft = 0;
  let timeoutHit = false;

  await new Promise((resolve) => {
    const engine = new GameEngine({
      answerTimeoutMs: 300,
      feedbackMs: 60,
      onPhaseChange: (phase, payload) => {
        if (phase === 'paused') {
          pausedLeft = payload.remainingAnswerMs;
        }
      },
      onAnswerTimeout: () => {
        timeoutHit = true;
        engine.destroy();
        resolve();
      }
    });

    engine.startInput();
    setTimeout(() => {
      engine.pause();
      setTimeout(() => {
        engine.resume();
      }, 60);
    }, 80);
  });

  assert.ok(pausedLeft > 150 && pausedLeft < 260);
  assert.equal(timeoutHit, true);
});
