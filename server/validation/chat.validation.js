/**
 * Validates chat message input.
 */
export const validateChatInput = (data) => {
  const errors = {};
  const mode = data.mode || 'ask';

  if (mode === 'ask') {
    if (!data.question || !data.question.trim()) {
      errors.question = 'Question is required for ask mode';
    } else if (data.question.trim().length < 3) {
      errors.question = 'Question must be at least 3 characters';
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};
