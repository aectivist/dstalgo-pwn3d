const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/requireAuth');
const { computeLevel } = require('../leveling');

const router = express.Router();

const TOP_N = 50;

const topUsers = db.prepare(`
  SELECT u.id, u.username, u.xp,
    (SELECT COUNT(DISTINCT s.problem_id) FROM submissions s WHERE s.user_id = u.id AND s.status = 'Accepted') AS solved
  FROM users u
  ORDER BY u.xp DESC, u.id ASC
  LIMIT ?
`);

const rankAbove = db.prepare(`
  SELECT COUNT(*) AS c FROM users WHERE xp > ? OR (xp = ? AND id < ?)
`);

const selfRow = db.prepare(`
  SELECT u.id, u.username, u.xp,
    (SELECT COUNT(DISTINCT s.problem_id) FROM submissions s WHERE s.user_id = u.id AND s.status = 'Accepted') AS solved
  FROM users u WHERE u.id = ?
`);

router.get('/', requireAuth, (req, res) => {
  const rows = topUsers.all(TOP_N);
  const leaderboard = rows.map((r, i) => ({
    rank: i + 1,
    username: r.username,
    xp: r.xp,
    solved: r.solved,
    level: computeLevel(r.xp),
    isYou: r.id === req.user.id,
  }));

  const me = selfRow.get(req.user.id);
  const inTop = leaderboard.some(r => r.isYou);
  const you = {
    rank: rankAbove.get(me.xp, me.xp, me.id).c + 1,
    username: me.username,
    xp: me.xp,
    solved: me.solved,
    level: computeLevel(me.xp),
    inTop,
  };

  res.json({ leaderboard, you });
});

module.exports = router;
