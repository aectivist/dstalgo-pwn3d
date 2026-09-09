const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { createSession, destroySession, setSessionCookie, clearSessionCookie } = require('../auth');
const { levelProgress } = require('../leveling');

const router = express.Router();

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

router.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({ error: 'Username must be 3-24 characters: letters, numbers, underscore' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'That username is already taken' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
  const { token } = createSession(info.lastInsertRowid);
  setSessionCookie(res, token);
  res.json({ user: { id: info.lastInsertRowid, username, xp: 0, ...levelProgress(0) } });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const user = db.prepare('SELECT id, username, password_hash, xp FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const { token } = createSession(user.id);
  setSessionCookie(res, token);
  res.json({ user: { id: user.id, username: user.username, xp: user.xp, ...levelProgress(user.xp) } });
});

router.post('/logout', (req, res) => {
  if (req.sessionToken) destroySession(req.sessionToken);
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  res.json({ user: req.user || null });
});

module.exports = router;
