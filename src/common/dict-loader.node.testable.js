// 该文件仅用于 Node 单测，避免依赖 uni 环境与别名导入。

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
