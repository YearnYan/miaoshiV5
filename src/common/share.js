import { APP_VERSION } from './config.js';

function safeNickname(value) {
  if (!value) return '用户';
  return `${value}`.trim().slice(0, 12) || '用户';
}

export function buildSharePayload({ uid, nickname, score, grade, source }) {
  const inviteUid = uid || '';
  const userName = safeNickname(nickname);
  const scoreText = Number(score || 0);
  const gradeText = grade || 'A';
  const from = source || 'share';

  return {
    title: `${userName} 在秒视单词拿到 ${scoreText} 分（${gradeText}）`,
    path: `/pages/index/index?inviteUid=${encodeURIComponent(inviteUid)}&from=${encodeURIComponent(from)}&v=${encodeURIComponent(APP_VERSION)}`,
    imageUrl: '/static/ui/MJBSd.png'
  };
}

