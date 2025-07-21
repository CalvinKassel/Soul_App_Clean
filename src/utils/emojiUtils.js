/**
 * Dynamic Emoji Utilities
 * Provides randomized emoji selection for user actions to keep the interface fresh and engaging
 */

// Like emojis - positive, affectionate responses
const LIKE_EMOJIS = ['💕', '😍', '😊', '❤️', '🤩', '💖', '🥰', '😘', '💗', '✨'];

// Pass emojis - neutral/negative responses
const PASS_EMOJIS = ['👎', '😒', '😔', '🙅‍♀️', '🙅‍♂️', '😐', '🤷‍♀️', '🤷‍♂️', '😕', '👋'];

// Profile action emojis for UserProfileScreen
const PROFILE_ACTION_EMOJIS = {
  like: ['💕', '😍', '❤️', '🥰', '💖'],
  superLike: ['⭐', '💫', '🌟', '✨', '🔥'],
  pass: ['👎', '🙅‍♀️', '🙅‍♂️', '😐', '👋'],
  message: ['💬', '📩', '✉️', '💭', '🗨️']
};

/**
 * Get a random like emoji
 * @returns {string} Random like emoji
 */
export const getRandomLikeEmoji = () => {
  return LIKE_EMOJIS[Math.floor(Math.random() * LIKE_EMOJIS.length)];
};

/**
 * Get a random pass emoji
 * @returns {string} Random pass emoji
 */
export const getRandomPassEmoji = () => {
  return PASS_EMOJIS[Math.floor(Math.random() * PASS_EMOJIS.length)];
};

/**
 * Get a random emoji for a specific profile action
 * @param {string} actionType - Type of action (like, superLike, pass, message)
 * @returns {string} Random emoji for the action type
 */
export const getRandomProfileActionEmoji = (actionType) => {
  const emojis = PROFILE_ACTION_EMOJIS[actionType];
  if (!emojis || emojis.length === 0) {
    return '❤️'; // Fallback
  }
  return emojis[Math.floor(Math.random() * emojis.length)];
};

/**
 * Get a pair of randomized like/pass emojis for action buttons
 * @returns {Object} Object with like and pass emojis
 */
export const getRandomActionEmojis = () => {
  return {
    like: getRandomLikeEmoji(),
    pass: getRandomPassEmoji()
  };
};

/**
 * Get all profile action emojis with randomization
 * @returns {Object} Object with randomized emojis for all profile actions
 */
export const getRandomProfileEmojis = () => {
  return {
    like: getRandomProfileActionEmoji('like'),
    superLike: getRandomProfileActionEmoji('superLike'),
    pass: getRandomProfileActionEmoji('pass'),
    message: getRandomProfileActionEmoji('message')
  };
};

/**
 * Rotate emoji based on previous selection to avoid repetition
 * @param {string} previousEmoji - Previously used emoji
 * @param {string} actionType - Type of action (like/pass)
 * @returns {string} Different emoji from the same category
 */
export const getRotatedEmoji = (previousEmoji, actionType) => {
  const emojiArray = actionType === 'like' ? LIKE_EMOJIS : PASS_EMOJIS;
  
  // Filter out the previous emoji to ensure variety
  const availableEmojis = emojiArray.filter(emoji => emoji !== previousEmoji);
  
  if (availableEmojis.length === 0) {
    // If somehow we filtered all emojis, fall back to random selection
    return emojiArray[Math.floor(Math.random() * emojiArray.length)];
  }
  
  return availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
};

export default {
  getRandomLikeEmoji,
  getRandomPassEmoji,
  getRandomProfileActionEmoji,
  getRandomActionEmojis,
  getRandomProfileEmojis,
  getRotatedEmoji
};