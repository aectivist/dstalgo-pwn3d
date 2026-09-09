const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/requireAuth');
const { xpForDifficulty, computeLevel } = require('../leveling');
const { runCSharp } = require('../csharpJudge');

const router = express.Router();

// List all categories with their problems, plus solved status for the current user.
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT id, slug, name, description FROM categories ORDER BY order_index').all();
  const problems = db.prepare(`
    SELECT id, slug, title, category_id, difficulty, order_index
    FROM problems ORDER BY category_id, order_index
  `).all();

  let solvedIds = new Set();
  if (req.user) {
    const rows = db.prepare(`
      SELECT DISTINCT problem_id FROM submissions WHERE user_id = ? AND status = 'Accepted'
    `).all(req.user.id);
    solvedIds = new Set(rows.map(r => r.problem_id));
  }

  const byCategory = categories.map(cat => ({
    ...cat,
    problems: problems
      .filter(p => p.category_id === cat.id)
      .map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        solved: solvedIds.has(p.id),
      })),
  }));

  res.json({ categories: byCategory });
});

// Get a single problem. Note: preamble/driver/tests are NOT sent to the
// client -- the C# judge runs entirely server-side now (see /run, /submit),
// since arbitrary C# can't be safely sandboxed in the browser the way the
// old JavaScript Web Worker judge could be.
router.get('/:slug', (req, res) => {
  const p = db.prepare(`
    SELECT p.slug, p.title, p.difficulty, p.description_html, p.starter_code,
           c.name AS category_name, c.slug AS category_slug
    FROM problems p JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ?
  `).get(req.params.slug);

  if (!p) return res.status(404).json({ error: 'Problem not found' });

  let lastSubmission = null;
  if (req.user) {
    lastSubmission = db.prepare(`
      SELECT code, status, passed, total, created_at
      FROM submissions WHERE user_id = ? AND problem_id = (SELECT id FROM problems WHERE slug = ?)
      ORDER BY created_at DESC LIMIT 1
    `).get(req.user.id, req.params.slug);
  }

  res.json({
    problem: {
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      categoryName: p.category_name,
      categorySlug: p.category_slug,
      descriptionHtml: p.description_html,
      starterCode: p.starter_code,
    },
    lastSubmission,
  });
});

async function judgeSlug(slug, code) {
  const p = db.prepare('SELECT id, difficulty, preamble, driver, tests_json FROM problems WHERE slug = ?').get(slug);
  if (!p) return { error: 'not_found' };

  const judgeResult = await runCSharp({
    preamble: p.preamble,
    code,
    driver: p.driver,
    testsJson: p.tests_json,
  });

  return { problem: p, judgeResult };
}

// Merges each test's original `args` back in (for display in the results
// panel) -- the judge host itself only knows about Output/Expected/Pass.
function summarize(judgeResult, testsJson) {
  if (!judgeResult.ok) {
    return { ok: false, error: judgeResult.error, passed: 0, total: 0, results: [] };
  }
  let tests = [];
  try { tests = JSON.parse(testsJson) || []; } catch (e) { /* leave empty */ }
  const results = (judgeResult.results || []).map((r, i) => ({
    ...r,
    args: tests[i] ? tests[i].args : undefined,
  }));
  const passed = results.filter(r => r.pass).length;
  return { ok: true, results, passed, total: results.length };
}

// Run code without recording a submission (no XP, no history).
router.post('/:slug/run', async (req, res) => {
  const { code } = req.body || {};
  if (typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const { problem, judgeResult, error } = await judgeSlug(req.params.slug, code);
  if (error === 'not_found' || !problem) return res.status(404).json({ error: 'Problem not found' });

  res.json(summarize(judgeResult, problem.tests_json));
});

const insertSubmission = db.prepare(`
  INSERT INTO submissions (user_id, problem_id, code, status, passed, total)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const countPriorAccepted = db.prepare(`
  SELECT COUNT(*) AS c FROM submissions WHERE user_id = ? AND problem_id = ? AND status = 'Accepted'
`);
const addUserXp = db.prepare(`UPDATE users SET xp = xp + ? WHERE id = ?`);

// Run code AND record a submission. XP is awarded only the first time a
// user gets a problem Accepted. The server computes pass/fail itself now
// (rather than trusting client-reported numbers), since the judge runs here.
router.post('/:slug/submit', requireAuth, async (req, res) => {
  const { code } = req.body || {};
  if (typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const { problem, judgeResult, error } = await judgeSlug(req.params.slug, code);
  if (error === 'not_found' || !problem) return res.status(404).json({ error: 'Problem not found' });

  const summary = summarize(judgeResult, problem.tests_json);
  const status = summary.ok && summary.total > 0 && summary.passed === summary.total ? 'Accepted' : 'Failed';

  const xpBefore = db.prepare('SELECT xp FROM users WHERE id = ?').get(req.user.id).xp;
  const isFirstAccept = status === 'Accepted' && countPriorAccepted.get(req.user.id, problem.id).c === 0;
  const xpAwarded = isFirstAccept ? xpForDifficulty(problem.difficulty) : 0;

  const submit = db.transaction(() => {
    insertSubmission.run(req.user.id, problem.id, code, status, summary.passed, summary.total);
    if (xpAwarded > 0) addUserXp.run(xpAwarded, req.user.id);
  });
  submit();

  const xpAfter = xpBefore + xpAwarded;
  res.json({
    ...summary,
    status,
    xpAwarded,
    xp: xpAfter,
    level: computeLevel(xpAfter),
    leveledUp: computeLevel(xpAfter) > computeLevel(xpBefore),
  });
});

// Submission history for the current user on a given problem.
router.get('/:slug/submissions', requireAuth, (req, res) => {
  const p = db.prepare('SELECT id FROM problems WHERE slug = ?').get(req.params.slug);
  if (!p) return res.status(404).json({ error: 'Problem not found' });

  const rows = db.prepare(`
    SELECT id, status, passed, total, created_at
    FROM submissions WHERE user_id = ? AND problem_id = ?
    ORDER BY created_at DESC LIMIT 20
  `).all(req.user.id, p.id);

  res.json({ submissions: rows });
});

module.exports = router;
