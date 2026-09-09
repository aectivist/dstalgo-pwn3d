const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { xpForDifficulty } = require('./leveling');

const dataDir = path.join(__dirname, '..', 'data');
// data/ isn't committed to the repo (only the DB inside it is gitignored,
// and git doesn't track empty directories), so a fresh clone won't have it
// yet -- better-sqlite3 can create the .db file but not a missing parent
// directory, so create it ourselves first.
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'app.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS problems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL,
  description_html TEXT NOT NULL,
  function_name TEXT NOT NULL,
  preamble TEXT NOT NULL DEFAULT '',
  driver TEXT NOT NULL,
  starter_code TEXT NOT NULL,
  tests_json TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  status TEXT NOT NULL,
  passed INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON submissions(user_id, problem_id);
`);

// Migration: add users.xp if this DB predates the leveling system, and
// backfill it from existing Accepted submission history so nobody's
// progress is lost.
const userColumns = db.prepare(`PRAGMA table_info(users)`).all().map(c => c.name);
if (!userColumns.includes('xp')) {
  db.exec(`ALTER TABLE users ADD COLUMN xp INTEGER NOT NULL DEFAULT 0`);

  const users = db.prepare(`SELECT id FROM users`).all();
  const solvedProblems = db.prepare(`
    SELECT DISTINCT s.problem_id AS problem_id, p.difficulty AS difficulty
    FROM submissions s
    JOIN problems p ON p.id = s.problem_id
    WHERE s.user_id = ? AND s.status = 'Accepted'
  `);
  const setXp = db.prepare(`UPDATE users SET xp = ? WHERE id = ?`);

  const backfill = db.transaction(() => {
    for (const u of users) {
      const rows = solvedProblems.all(u.id);
      const xp = rows.reduce((sum, r) => sum + xpForDifficulty(r.difficulty), 0);
      setXp.run(xp, u.id);
    }
  });
  backfill();
}

module.exports = db;
