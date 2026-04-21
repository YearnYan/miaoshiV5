<template>
  <view class="pixel-screen game-page">
    <image class="pixel-bg" :src="bgSrc" mode="scaleToFill" />

    <view class="pixel-layer">
      <view class="pixel-hotspot pause-hotspot" @click="pauseGame" />

      <view v-if="phase === 'input'" class="pixel-hotspot option1-hotspot" @click="onSelectAt(0)" />
      <view v-if="phase === 'input'" class="pixel-hotspot option2-hotspot" @click="onSelectAt(1)" />
      <view v-if="phase === 'input'" class="pixel-hotspot option3-hotspot" @click="onSelectAt(2)" />
      <view v-if="phase === 'input'" class="pixel-hotspot option4-hotspot" @click="onSelectAt(3)" />

      <view v-if="phase === 'feedback'" class="pixel-hotspot feedback-next-hotspot" @click="gotoNextWord" />

      <view v-if="phase === 'paused'" class="pause-mask" />
      <image
        v-if="phase === 'paused'"
        class="pause-modal"
        src="/static/ui/Fz2Z0.png"
        mode="scaleToFill"
      />
      <view v-if="phase === 'paused'" class="pixel-hotspot pause-continue-hotspot" @click="resumeGame" />
      <view v-if="phase === 'paused'" class="pixel-hotspot pause-diff-hotspot" @click="openDifficultyModal" />
      <view v-if="phase === 'paused'" class="pixel-hotspot pause-quit-hotspot" @click="quitGame" />

      <view class="overlay-text game-score mono">{{ store.game.score }}</view>
      <view class="overlay-text game-progress mono">{{ store.game.answered }} / {{ roundTotal }}</view>
      <view class="overlay-text game-combo mono">{{ store.game.combo }}</view>
      <view class="overlay-text game-acc mono">{{ accuracyText }}</view>

      <view v-if="phase === 'flash'" class="overlay-text flash-word mono">{{ currentWord }}</view>

      <view v-if="phase === 'input'" class="overlay-text question-index">
        第 {{ store.game.answered + 1 }} 题 / 共 {{ roundTotal }} 题
      </view>
      <view v-if="phase === 'input'" class="overlay-text input-word mono">{{ currentWord }}</view>
      <view v-if="phase === 'input'" class="overlay-text option-text option-text-1">{{ optionText(0) }}</view>
      <view v-if="phase === 'input'" class="overlay-text option-text option-text-2">{{ optionText(1) }}</view>
      <view v-if="phase === 'input'" class="overlay-text option-text option-text-3">{{ optionText(2) }}</view>
      <view v-if="phase === 'input'" class="overlay-text option-text option-text-4">{{ optionText(3) }}</view>
      <view v-if="phase === 'input'" class="overlay-text answer-left">{{ answerSeconds }}s</view>

      <view v-if="phase === 'feedback'" :class="['overlay-text feedback-title', feedback?.correct ? 'success' : 'danger']">
        {{ feedback?.correct ? '回答正确' : '回答错误' }}
      </view>
      <view v-if="phase === 'feedback'" class="overlay-text feedback-word mono">{{ feedback?.word }}</view>
      <view v-if="phase === 'feedback'" class="overlay-text feedback-def">正确释义：{{ feedback?.definition }}</view>
      <view v-if="phase === 'feedback'" class="overlay-text feedback-picked">你的选择：{{ feedback?.selected }}</view>
      <view v-if="phase === 'feedback'" class="overlay-text feedback-score mono">
        {{ feedback?.scoreDelta >= 0 ? '+' : '' }}{{ feedback?.scoreDelta }}
      </view>

      <view v-if="pageLoading" class="loading-mask">
        <view class="loading-card">
          <text class="loading-title">词库加载中...</text>
          <text class="loading-desc">{{ loadingMessage }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { DATASETS, DIFFICULTIES, ROUND_TOTAL_QUESTIONS, TELEMETRY_EVENT } from '@/common/config.js';
import { buildOptions, generateQuestionSet, loadWords } from '@/common/dict-loader.js';
import { evaluateEntitlement } from '@/common/entitlement.js';
import { GameEngine } from '@/common/game-engine.js';
import { safeNavigateTo, safeReLaunch, safeRedirectTo } from '@/common/nav.js';
import { calculateRoundSummary, calculateScoreDelta } from '@/common/scoring.js';
import { submitRound } from '@/common/service.js';
import { track } from '@/common/telemetry.js';
import { upsertWrongAnswers } from '@/common/wrongbook.js';
import {
  addVocabWord,
  canContinueRound,
  commitAnswer,
  consumeFreeQuota,
  nextWord,
  setRoundPhase,
  setRoundResult,
  setUser,
  startRound,
  store,
  updateDifficulty
} from '@/common/store.js';

const DIFFICULTY_ORDER = ['godlike', 'pro', 'fast', 'rookie'];

export default {
  data() {
    return {
      store,
      phase: 'idle',
      pageLoading: true,
      loadingMessage: '正在校验词库与会话...',
      feedback: null,
      answerLeftMs: 0,
      inputStartedAt: 0,
      allWords: [],
      knownWords: new Set(),
      submitting: false,
      engine: null
    };
  },
  computed: {
    roundTotal() {
      return ROUND_TOTAL_QUESTIONS;
    },
    difficultyLabel() {
      return DIFFICULTIES[this.store.game.difficulty]?.label || '极限档';
    },
    datasetName() {
      return DATASETS.find((item) => item.key === this.store.game.datasetKey)?.name || '未知词库';
    },
    currentWord() {
      return this.store.game.currentWord?.word || '...';
    },
    answerPercent() {
      const total = this.engine?.options?.answerTimeoutMs || 5000;
      return Math.max(Math.min((this.answerLeftMs / total) * 100, 100), 0);
    },
    answerSeconds() {
      return Number((this.answerLeftMs / 1000).toFixed(1));
    },
    accuracyText() {
      if (!this.store.game.answered) return '0%';
      return `${Math.round((this.store.game.correct / this.store.game.answered) * 100)}%`;
    },
    bgSrc() {
      if (this.phase === 'feedback') {
        return this.feedback?.correct ? '/static/ui/R5pWs.png' : '/static/ui/NV9tX.png';
      }
      if (this.phase === 'input') {
        return '/static/ui/AGIjF.png';
      }
      return '/static/ui/lzjNs.png';
    }
  },
  onLoad() {
    this.initEngine();
    this.bootstrapRound();
  },
  onHide() {
    if (this.phase === 'flash' || this.phase === 'input') {
      this.engine.pause();
    }
  },
  onUnload() {
    this.engine?.destroy();
  },
  methods: {
    optionText(index) {
      const hit = this.store.game.options[index];
      return hit?.value || '';
    },
    onSelectAt(index) {
      const option = this.store.game.options[index];
      if (!option) return;
      this.onSelectOption(option);
    },
    initEngine() {
      this.engine = new GameEngine({
        onPhaseChange: (phase) => {
          this.phase = phase;
          setRoundPhase(phase);
        },
        onFlashEnd: () => {
          this.revealOptions();
        },
        onAnswerTimeout: () => {
          this.resolveAnswer(null, true);
        },
        onFeedbackDone: () => {
          this.gotoNextWord();
        },
        onAnswerTick: (left) => {
          this.answerLeftMs = left;
        }
      });
    },
    async bootstrapRound() {
      if (!this.store.user.uid) {
        safeRedirectTo('/pages/login/login?redirect=%2Fpages%2Fgame%2Fgame');
        return;
      }

      const entitlement = evaluateEntitlement({
        user: this.store.user,
        datasetKey: this.store.game.datasetKey,
        freeLimit: this.store.paywall.freeLimit
      });
      if (entitlement.blocked) {
        safeRedirectTo(`/pages/paywall/paywall?reason=${entitlement.reason}&returnTo=game`);
        return;
      }

      this.pageLoading = true;
      this.loadingMessage = '正在拉取词库...';

      try {
        const dict = await loadWords(this.store.game.datasetKey);
        this.allWords = dict.words || [];
        const questionSet = generateQuestionSet(this.allWords, ROUND_TOTAL_QUESTIONS);
        startRound(questionSet);
        this.knownWords = new Set();
        this.pageLoading = false;
        track(TELEMETRY_EVENT.GAME_START, {
          datasetKey: this.store.game.datasetKey,
          difficulty: this.store.game.difficulty,
          wordSource: dict.source
        });
        this.startCycle();
      } catch (error) {
        uni.showToast({
          title: '词库加载失败',
          icon: 'none'
        });
        setTimeout(() => {
          safeReLaunch('/pages/index/index');
        }, 300);
      }
    },
    startCycle() {
      this.feedback = null;
      if (!this.store.game.currentWord || this.store.game.answered >= ROUND_TOTAL_QUESTIONS) {
        this.finishRound();
        return;
      }
      this.engine.startFlash(this.store.game.exposureMs);
    },
    revealOptions() {
      const target = this.store.game.currentWord;
      if (!target) {
        this.finishRound();
        return;
      }
      this.store.game.options = buildOptions(target, this.allWords);
      this.inputStartedAt = Date.now();
      this.answerLeftMs = this.engine.options.answerTimeoutMs;
      this.engine.startInput();
    },
    onSelectOption(option) {
      if (this.phase !== 'input') return;
      this.resolveAnswer(option, false);
    },
    resolveAnswer(option, timeout) {
      const word = this.store.game.currentWord;
      if (!word) return;
      if (this.phase !== 'input') return;

      const responseMs = timeout
        ? this.engine.options.answerTimeoutMs
        : Math.max(Date.now() - this.inputStartedAt, 0);
      const correct = Boolean(option?.correct);
      const nextCombo = correct ? this.store.game.combo + 1 : 0;
      const firstCorrect = correct && !this.knownWords.has(word.word);
      if (firstCorrect) {
        this.knownWords.add(word.word);
      }

      const scoreDelta = calculateScoreDelta({
        correct,
        combo: nextCombo,
        level: word.level || 1,
        difficulty: this.store.game.difficulty
      });

      commitAnswer({
        word: word.word,
        datasetKey: word.datasetKey,
        level: word.level || 1,
        correct,
        selected: option?.value || null,
        answer: word.definition,
        scoreDelta,
        responseMs,
        firstCorrect,
        timeout
      });

      track(TELEMETRY_EVENT.FLASH_ANSWER, {
        word: word.word,
        correct,
        responseMs,
        combo: nextCombo
      });

      this.feedback = {
        correct,
        word: word.word,
        definition: word.definition,
        selected: option?.value || '超时未作答',
        scoreDelta
      };

      this.maybeSuggestDowngrade();
      this.engine.startFeedback({
        correct
      });
    },
    maybeSuggestDowngrade() {
      if (this.store.game.downgradedPrompted) return;
      if (this.store.game.answered < 10) return;
      const accuracy = Math.round((this.store.game.correct / this.store.game.answered) * 100);
      if (accuracy >= 30) return;

      const targetDifficulty = this.getLowerDifficulty(this.store.game.difficulty);
      if (!targetDifficulty) return;

      this.store.game.downgradedPrompted = true;
      uni.showModal({
        title: '建议调整',
        content: `前${this.store.game.answered}题正确率仅${accuracy}%，建议切换为${DIFFICULTIES[targetDifficulty].label}。`,
        confirmText: '立即切换',
        cancelText: '保持当前',
        success: (res) => {
          if (!res.confirm) return;
          updateDifficulty(targetDifficulty);
          uni.showToast({
            title: `已切换为${DIFFICULTIES[targetDifficulty].label}`,
            icon: 'none'
          });
        }
      });
    },
    getLowerDifficulty(currentDifficulty) {
      const index = DIFFICULTY_ORDER.indexOf(currentDifficulty);
      if (index < 0 || index >= DIFFICULTY_ORDER.length - 1) return null;
      return DIFFICULTY_ORDER[index + 1];
    },
    openDifficultyModal() {
      safeNavigateTo('/pages/difficulty/difficulty?from=game');
    },
    gotoNextWord() {
      nextWord();
      if (canContinueRound()) {
        this.startCycle();
        return;
      }
      this.finishRound();
    },
    async finishRound() {
      if (this.submitting) return;
      this.submitting = true;
      this.engine.finish();

      const summary = calculateRoundSummary(this.store.game.answerHistory, this.store.game.difficulty);
      const durationMs = Math.max(Date.now() - this.store.game.roundStartAt, 0);
      const payload = {
        roundId: this.store.game.roundId,
        datasetKey: this.store.game.datasetKey,
        difficulty: this.store.game.difficulty,
        answers: this.store.game.answerHistory,
        clientScore: summary.finalScore,
        durationMs
      };

      let result = {};
      try {
        result = await submitRound(payload);
      } catch (error) {
        result = {};
      }

      const finalScore = Number(result.finalScore || summary.finalScore);
      const newWords = Number(result.newWords ?? summary.newWords);
      const rankChanged = result.rankChanged || {
        friendDelta: 0,
        worldDelta: 0
      };

      setRoundResult({
        finalScore,
        maxCombo: summary.maxCombo,
        newWords,
        accuracy: summary.accuracy,
        avgResponseSec: summary.avgResponseSec,
        wrongAdded: summary.wrongAdded,
        grade: summary.grade,
        rank: {
          friend: {
            rank: Math.max(1, (this.store.rank.myRank || 1200) - (rankChanged.friendDelta || 0)),
            total: 5000,
            surpass: Math.max(
              0,
              5000 - Math.max(1, (this.store.rank.myRank || 1200) - (rankChanged.friendDelta || 0))
            )
          },
          world: {
            percentile: Math.max(1, Math.min(99, 50 - (rankChanged.worldDelta || 0))),
            title: finalScore >= 9000 ? '超凡表现' : '持续进步'
          }
        }
      });

      setUser({
        bestScore: Math.max(this.store.user.bestScore || 0, finalScore),
        totalRounds: (this.store.user.totalRounds || 0) + 1
      });
      consumeFreeQuota(summary.answerCount);
      const freshWords = this.store.game.answerHistory.filter((item) => item.firstCorrect).map((item) => item.word);
      addVocabWord(freshWords);
      upsertWrongAnswers(this.store.game.answerHistory);

      track(TELEMETRY_EVENT.ROUND_FINISH, {
        finalScore,
        accuracy: summary.accuracy,
        newWords,
        durationMs,
        difficulty: this.store.game.difficulty
      });

      safeRedirectTo('/pages/result/result');
    },
    pauseGame() {
      if (this.phase === 'flash' || this.phase === 'input') {
        this.engine.pause();
      }
    },
    resumeGame() {
      if (this.phase === 'paused') {
        this.engine.resume(this.store.game.exposureMs);
      }
    },
    quitGame() {
      this.engine.destroy();
      safeReLaunch('/pages/index/index');
    }
  }
};
</script>

<style lang="scss" scoped>
.game-page {
  background: #050806;
}

.pause-hotspot {
  left: 32rpx;
  top: 110rpx;
  width: 86rpx;
  height: 86rpx;
}

.option1-hotspot,
.option2-hotspot,
.option3-hotspot,
.option4-hotspot {
  left: 48rpx;
  width: 654rpx;
  height: 108rpx;
}

.option1-hotspot {
  top: 842rpx;
}

.option2-hotspot {
  top: 968rpx;
}

.option3-hotspot {
  top: 1094rpx;
}

.option4-hotspot {
  top: 1220rpx;
}

.feedback-next-hotspot {
  left: 210rpx;
  top: 1314rpx;
  width: 330rpx;
  height: 76rpx;
}

.pause-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.62);
}

.pause-modal {
  position: absolute;
  left: 0;
  top: 0;
  width: 750rpx;
  height: 1624rpx;
  z-index: 6;
}

.pause-continue-hotspot,
.pause-diff-hotspot,
.pause-quit-hotspot {
  z-index: 7;
  left: 88rpx;
  width: 574rpx;
}

.pause-continue-hotspot {
  top: 1060rpx;
  height: 102rpx;
}

.pause-diff-hotspot {
  top: 1184rpx;
  height: 90rpx;
}

.pause-quit-hotspot {
  top: 1294rpx;
  height: 90rpx;
}

.overlay-text {
  position: absolute;
  pointer-events: none;
  color: #e8ffe8;
}

.game-score {
  right: 52rpx;
  top: 122rpx;
  font-size: 40rpx;
  font-weight: 700;
}

.game-progress,
.game-combo,
.game-acc {
  top: 272rpx;
  font-size: 30rpx;
  font-weight: 700;
}

.game-progress {
  left: 96rpx;
}

.game-combo {
  left: 334rpx;
}

.game-acc {
  left: 560rpx;
}

.flash-word {
  left: 96rpx;
  top: 620rpx;
  width: 558rpx;
  text-align: center;
  font-size: 84rpx;
  font-weight: 700;
}

.question-index {
  left: 208rpx;
  top: 482rpx;
  font-size: 22rpx;
  color: #9eaba2;
}

.input-word {
  left: 96rpx;
  top: 544rpx;
  width: 558rpx;
  text-align: center;
  font-size: 70rpx;
  font-weight: 700;
}

.option-text {
  left: 92rpx;
  width: 566rpx;
  font-size: 30rpx;
  line-height: 108rpx;
}

.option-text-1 {
  top: 842rpx;
}

.option-text-2 {
  top: 968rpx;
}

.option-text-3 {
  top: 1094rpx;
}

.option-text-4 {
  top: 1220rpx;
}

.answer-left {
  right: 64rpx;
  top: 1360rpx;
  font-size: 22rpx;
  color: #9eaba2;
}

.feedback-title {
  left: 0;
  top: 660rpx;
  width: 750rpx;
  text-align: center;
  font-size: 58rpx;
  font-weight: 700;
}

.feedback-word {
  left: 0;
  top: 752rpx;
  width: 750rpx;
  text-align: center;
  font-size: 72rpx;
  font-weight: 700;
}

.feedback-def,
.feedback-picked {
  left: 108rpx;
  width: 534rpx;
  font-size: 24rpx;
  line-height: 36rpx;
  color: #a8b5ad;
}

.feedback-def {
  top: 914rpx;
}

.feedback-picked {
  top: 962rpx;
}

.feedback-score {
  left: 0;
  top: 1038rpx;
  width: 750rpx;
  text-align: center;
  font-size: 42rpx;
  font-weight: 700;
}

.loading-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-card {
  width: 540rpx;
  padding: 34rpx 28rpx;
  border-radius: 26rpx;
  background: rgba(17, 21, 26, 0.96);
  border: 2rpx solid rgba(30, 220, 116, 0.4);
  text-align: center;
}

.loading-title {
  display: block;
  color: #e8ffe8;
  font-size: 34rpx;
  font-weight: 700;
}

.loading-desc {
  display: block;
  margin-top: 12rpx;
  color: #9eaba2;
  font-size: 24rpx;
}
</style>



