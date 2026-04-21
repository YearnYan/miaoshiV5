export function validateInviteClaim(inviterUid, currentUid) {
  if (!inviterUid) return { valid: false, reason: 'invalid_invite' };
  if (currentUid && inviterUid === currentUid) {
    return { valid: false, reason: 'invalid_invite' };
  }
  return { valid: true, reason: null };
}

