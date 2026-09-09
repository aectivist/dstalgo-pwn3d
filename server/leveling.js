// XP + leveling rules, shared by the submit route (awarding XP), the auth
// route (reporting the current user's level), and the leaderboard route.

const XP_PER_DIFFICULTY = { Easy: 10, Medium: 25, Hard: 50 };

// Cumulative XP required to REACH a given level (level 1 starts at 0).
// Quadratic curve so each level takes progressively more XP.
function xpThreshold(level) {
  if (level <= 1) return 0;
  return 25 * level * (level - 1);
}

function computeLevel(xp) {
  let level = 1;
  while (xpThreshold(level + 1) <= xp) level++;
  return level;
}

// Returns level + progress toward the next level, for progress bars.
function levelProgress(xp) {
  const level = computeLevel(xp);
  const currentThreshold = xpThreshold(level);
  const nextThreshold = xpThreshold(level + 1);
  const span = nextThreshold - currentThreshold;
  const progress = span > 0 ? (xp - currentThreshold) / span : 1;
  return { level, xp, currentThreshold, nextThreshold, progress };
}

function xpForDifficulty(difficulty) {
  return XP_PER_DIFFICULTY[difficulty] || 0;
}

module.exports = { XP_PER_DIFFICULTY, xpThreshold, computeLevel, levelProgress, xpForDifficulty };
