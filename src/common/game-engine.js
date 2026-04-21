import { ANSWER_TIMEOUT_MS, FEEDBACK_STAY_MS } from './config.js';

export class GameEngine {
  constructor(options = {}) {
    this.phase = 'idle';
    this.flashTimer = null;
    this.answerTimer = null;
    this.feedbackTimer = null;
    this.answerDeadline = 0;
    this.remainingAnswerMs = ANSWER_TIMEOUT_MS;
    this.options = {
      answerTimeoutMs: options.answerTimeoutMs || ANSWER_TIMEOUT_MS,
      feedbackMs: options.feedbackMs || FEEDBACK_STAY_MS,
      onPhaseChange: options.onPhaseChange || (() => {}),
      onFlashEnd: options.onFlashEnd || (() => {}),
      onAnswerTimeout: options.onAnswerTimeout || (() => {}),
      onFeedbackDone: options.onFeedbackDone || (() => {}),
      onAnswerTick: options.onAnswerTick || (() => {})
    };
    this.tickTimer = null;
  }

  setPhase(phase, payload = {}) {
    this.phase = phase;
    this.options.onPhaseChange(phase, payload);
  }

  startFlash(exposureMs) {
    this.clearTimers();
    this.setPhase('flash', { exposureMs });
    this.flashTimer = setTimeout(() => {
      this.flashTimer = null;
      this.options.onFlashEnd();
    }, exposureMs);
  }

  startInput() {
    this.clearInputTimers();
    this.setPhase('input');
    this.remainingAnswerMs = this.options.answerTimeoutMs;
    this.answerDeadline = Date.now() + this.remainingAnswerMs;
    this.answerTimer = setTimeout(() => {
      this.answerTimer = null;
      this.options.onAnswerTimeout();
    }, this.remainingAnswerMs);
    this.startTick();
  }

  startFeedback(payload = {}) {
    this.clearInputTimers();
    this.setPhase('feedback', payload);
    this.feedbackTimer = setTimeout(() => {
      this.feedbackTimer = null;
      this.options.onFeedbackDone();
    }, this.options.feedbackMs);
  }

  pause() {
    if (this.phase !== 'input' && this.phase !== 'flash') return;

    if (this.phase === 'input') {
      this.remainingAnswerMs = Math.max(this.answerDeadline - Date.now(), 0);
    }
    this.clearTimers();
    this.setPhase('paused', { remainingAnswerMs: this.remainingAnswerMs });
  }

  resume(exposureMs = 0) {
    if (this.phase !== 'paused') return;

    if (this.remainingAnswerMs > 0 && this.remainingAnswerMs < this.options.answerTimeoutMs) {
      this.setPhase('input');
      this.answerDeadline = Date.now() + this.remainingAnswerMs;
      this.answerTimer = setTimeout(() => {
        this.answerTimer = null;
        this.options.onAnswerTimeout();
      }, this.remainingAnswerMs);
      this.startTick();
      return;
    }

    this.startFlash(exposureMs);
  }

  finish() {
    this.clearTimers();
    this.setPhase('finished');
  }

  clearInputTimers() {
    if (this.answerTimer) {
      clearTimeout(this.answerTimer);
      this.answerTimer = null;
    }
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  clearTimers() {
    if (this.flashTimer) {
      clearTimeout(this.flashTimer);
      this.flashTimer = null;
    }
    this.clearInputTimers();
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }
  }

  destroy() {
    this.clearTimers();
  }

  startTick() {
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = setInterval(() => {
      const left = Math.max(this.answerDeadline - Date.now(), 0);
      this.options.onAnswerTick(left);
      if (!left && this.tickTimer) {
        clearInterval(this.tickTimer);
        this.tickTimer = null;
      }
    }, 100);
  }
}
