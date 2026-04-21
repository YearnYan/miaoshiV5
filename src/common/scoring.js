import { DIFFICULTIES } from './config.js';

export function calculateScoreDelta({ correct, combo, level, difficulty }) {
  const base = correct ? 100 : 0;
  const comboBonus = correct ? Math.min(combo, 20) * 8 : 0;
  const wordLevelBonus = (level || 1) * 5;
  const factor = DIFFICULTIES[difficulty]?.factor || 1;
  return Math.round((base + comboBonus + wordLevelBonus) * factor);
}

export function gradeByScore(finalScore) {
  if (finalScore >= 9000) return '超神';
  if (finalScore >= 7000) return 'S';
  if (finalScore >= 5000) return 'A';
  if (finalScore >= 3000) return 'B';
  return 'C';
}

export function calculateRoundSummary(answers = [], difficulty = 'godlike') {
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let correct = 0;
  let reactionTotal = 0;
  let wrongAdded = 0;
  const newWords = new Set();

  for (const item of answers) {
    const isCorrect = Boolean(item.correct);
    combo = isCorrect ? combo + 1 : 0;
    maxCombo = Math.max(maxCombo, combo);
    if (isCorrect) {
      correct += 1;
      if (item.firstCorrect) {
        newWords.add(item.word);
      }
    } else {
      wrongAdded += 1;
    }
    const delta = calculateScoreDelta({
      correct: isCorrect,
      combo,
      level: item.level || 1,
      difficulty
    });
    score += delta;
    reactionTotal += item.responseMs || 0;
  }

  const accuracy = answers.length ? Math.round((correct / answers.length) * 100) : 0;
  return {
    finalScore: score,
    maxCombo,
    correctCount: correct,
    answerCount: answers.length,
    newWords: newWords.size,
    accuracy,
    avgResponseSec: answers.length ? Number((reactionTotal / answers.length / 1000).toFixed(2)) : 0,
    wrongAdded,
    grade: gradeByScore(score)
  };
}
