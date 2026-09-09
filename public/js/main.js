const appEl = document.getElementById('app');
const topbarUser = document.getElementById('topbar-user');

let currentUser = null;

document.querySelector('.brand').addEventListener('click', () => navigate('#/problems'));

function navigate(hash) {
  if (location.hash === hash) { render(); } else { location.hash = hash; }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

async function renderTopbar() {
  if (currentUser) {
    const pct = Math.max(0, Math.min(1, currentUser.progress || 0)) * 100;
    topbarUser.innerHTML = `
      <a class="nav-link" href="#/notes">Notes</a>
      <a class="nav-link" href="#/leaderboard">Leaderboard</a>
      <span class="level-badge" title="${Math.round(pct)}% to level ${currentUser.level + 1}">
        Lv ${currentUser.level}
        <span class="level-bar"><span class="level-bar-fill" style="width:${pct}%"></span></span>
        <span class="xp-text">${currentUser.xp} XP</span>
      </span>
      <span class="username">${escapeHtml(currentUser.username)}</span>
      <button class="btn-link" id="logout-btn">Sign out</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await api.logout();
      currentUser = null;
      navigate('#/login');
    });
  } else {
    topbarUser.innerHTML = '';
  }
}

async function requireUser() {
  if (currentUser) return currentUser;
  try {
    const { user } = await api.me();
    currentUser = user;
  } catch (e) { currentUser = null; }
  return currentUser;
}

// ---------- Views ----------

function viewAuth(mode) {
  const tpl = document.getElementById('tpl-auth');
  appEl.innerHTML = '';
  appEl.appendChild(tpl.content.cloneNode(true));

  const tabs = appEl.querySelectorAll('.auth-tab');
  const form = document.getElementById('auth-form');
  const submitBtn = document.getElementById('auth-submit');
  const errorEl = document.getElementById('auth-error');

  function setMode(m) {
    mode = m;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === m));
    submitBtn.textContent = m === 'login' ? 'Sign In' : 'Create Account';
    errorEl.textContent = '';
  }
  tabs.forEach(t => t.addEventListener('click', () => setMode(t.dataset.mode)));
  setMode(mode || 'login');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const username = form.username.value.trim();
    const password = form.password.value;
    try {
      const fn = mode === 'login' ? api.login : api.register;
      const { user } = await fn(username, password);
      currentUser = user;
      await renderTopbar();
      navigate('#/problems');
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

async function viewProblems() {
  appEl.innerHTML = '<p>Loading problems...</p>';
  let data;
  try {
    data = await api.listProblems();
  } catch (err) {
    appEl.innerHTML = `<p class="auth-error">${escapeHtml(err.message)}</p>`;
    return;
  }

  const tpl = document.getElementById('tpl-problems');
  appEl.innerHTML = '';
  appEl.appendChild(tpl.content.cloneNode(true));
  const listEl = document.getElementById('category-list');

  listEl.innerHTML = data.categories.map(cat => {
    const solvedCount = cat.problems.filter(p => p.solved).length;
    const rows = cat.problems.map(p => `
      <a class="problem-row" href="#/problem/${encodeURIComponent(p.slug)}">
        <span class="check">${p.solved ? '&#10003;' : ''}</span>
        <span class="title">${escapeHtml(p.title)}</span>
        <span class="badge ${p.difficulty}">${p.difficulty}</span>
      </a>
    `).join('');
    return `
      <div class="category-block">
        <div class="category-header">
          <h3>${escapeHtml(cat.name)}</h3>
          <span class="meta">${solvedCount} / ${cat.problems.length} solved</span>
        </div>
        ${rows}
      </div>
    `;
  }).join('');
}

async function viewLeaderboard() {
  appEl.innerHTML = '<p>Loading leaderboard...</p>';
  let data;
  try {
    data = await api.leaderboard();
  } catch (err) {
    appEl.innerHTML = `<p class="auth-error">${escapeHtml(err.message)}</p>`;
    return;
  }

  const tpl = document.getElementById('tpl-leaderboard');
  appEl.innerHTML = '';
  appEl.appendChild(tpl.content.cloneNode(true));

  document.getElementById('your-rank-card').innerHTML = `
    <div class="your-rank-row">
      <span class="your-rank-label">Your rank</span>
      <span class="your-rank-value">#${data.you.rank}</span>
      <span class="badge Medium">Lv ${data.you.level}</span>
      <span>${data.you.xp} XP</span>
      <span>${data.you.solved} solved</span>
    </div>
  `;

  document.getElementById('leaderboard-body').innerHTML = data.leaderboard.map(r => `
    <tr class="${r.isYou ? 'you-row' : ''}">
      <td>${r.rank}</td>
      <td>${escapeHtml(r.username)}${r.isYou ? ' <span class="you-tag">(you)</span>' : ''}</td>
      <td>Lv ${r.level}</td>
      <td>${r.xp}</td>
      <td>${r.solved}</td>
    </tr>
  `).join('');
}

async function viewNotes() {
  appEl.innerHTML = '<p>Loading notes...</p>';
  let data;
  try {
    data = await api.notes();
  } catch (err) {
    appEl.innerHTML = `<p class="auth-error">${escapeHtml(err.message)}</p>`;
    return;
  }

  const tpl = document.getElementById('tpl-notes');
  appEl.innerHTML = '';
  appEl.appendChild(tpl.content.cloneNode(true));
  const listEl = document.getElementById('notes-list');

  listEl.innerHTML = data.notes.map((n, i) => `
    <div class="notes-block">
      <div class="notes-header" data-index="${i}">
        <div class="notes-titlebar-left">
          <span class="notes-win-icon" aria-hidden="true"></span>
          <h3>${escapeHtml(n.title)}</h3>
        </div>
        <div class="notes-titlebar-right">
          <span class="win-btn win-min" aria-hidden="true"></span>
          <span class="win-btn win-max" aria-hidden="true"></span>
          <span class="win-btn win-close" aria-hidden="true"></span>
          <span class="notes-toggle-icon">&#9656;</span>
        </div>
      </div>
      <div class="notes-body" id="notes-body-${i}" hidden>${n.contentHtml}</div>
    </div>
  `).join('');

  listEl.querySelectorAll('.notes-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = document.getElementById(`notes-body-${header.dataset.index}`);
      const isOpen = header.classList.toggle('open');
      body.hidden = !isOpen;
    });
  });
}

// The judge runs entirely server-side now (see server/csharpJudge.js) --
// arbitrary C# can't be sandboxed in the browser the way the old JS Web
// Worker judge could be, so Run/Submit just POST the code and wait.

function renderResults(data) {
  const resultsEl = document.getElementById('results');
  if (!data.ok) {
    resultsEl.innerHTML = `<div class="result-summary fail">Error: ${escapeHtml(data.error)}</div>`;
    return null;
  }
  const { passed, total, results } = data;
  const allPass = total > 0 && passed === total;
  resultsEl.innerHTML = `
    <div class="result-summary ${allPass ? 'pass' : 'fail'}">${passed} / ${total} test cases passed</div>
    ${results.map((r, i) => `
      <div class="test-case ${r.pass ? 'pass' : 'fail'}">
        <span class="label">${r.pass ? 'PASS' : 'FAIL'}</span>
        Test ${i + 1}
        ${r.input ? `<pre class="test-io">input:\n${escapeHtml(r.input)}</pre>` : ''}
        ${r.pass ? '' : `<pre class="test-io">expected output:\n${escapeHtml(r.expected)}\n\n${r.error ? 'error:\n' + escapeHtml(r.error) : 'got:\n' + escapeHtml(r.output)}</pre>`}
      </div>
    `).join('')}
  `;
  return { passed, total };
}

async function viewSolve(slug) {
  appEl.innerHTML = '<p>Loading...</p>';
  let data;
  try {
    data = await api.getProblem(slug);
  } catch (err) {
    appEl.innerHTML = `<p class="auth-error">${escapeHtml(err.message)}</p>`;
    return;
  }
  const problem = data.problem;

  const tpl = document.getElementById('tpl-solve');
  appEl.innerHTML = '';
  appEl.appendChild(tpl.content.cloneNode(true));

  document.getElementById('problem-title').textContent = problem.title;
  const diffEl = document.getElementById('problem-difficulty');
  diffEl.textContent = problem.difficulty;
  diffEl.classList.add('badge', problem.difficulty);
  document.getElementById('problem-category').textContent = problem.categoryName;
  document.getElementById('problem-description').innerHTML = problem.descriptionHtml;

  // "cs:" namespace so drafts saved back when problems were JS-judged don't
  // resurface as invalid C# after the language switch.
  const storageKey = `dstalgo-code:cs:${slug}`;
  const textareaEl = document.getElementById('code-editor');
  const saved = localStorage.getItem(storageKey);
  textareaEl.value = saved || (data.lastSubmission ? data.lastSubmission.code : problem.starterCode);

  // CodeMirror.fromTextArea hides the original textarea and inserts a
  // sibling .CodeMirror element -- interact through the editor object
  // from here on, not the textarea directly (see public/css/base.css for
  // why the syntax-highlighting palette is shared across all 4 themes).
  const editor = CodeMirror.fromTextArea(textareaEl, {
    mode: 'text/x-csharp',
    theme: 'dstalgo',
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    viewportMargin: Infinity,
    extraKeys: { Tab: (cm) => cm.replaceSelection('    ', 'end') },
  });

  editor.on('change', () => localStorage.setItem(storageKey, editor.getValue()));

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Reset to starter code? This discards your current changes.')) {
      editor.setValue(problem.starterCode);
      localStorage.removeItem(storageKey);
      document.getElementById('results').innerHTML = '';
    }
  });

  document.getElementById('btn-run').addEventListener('click', async (e) => {
    e.target.disabled = true;
    document.getElementById('results').innerHTML = '<p>Compiling and running C#...</p>';
    try {
      const result = await api.run(slug, editor.getValue());
      renderResults(result);
    } catch (err) {
      document.getElementById('results').innerHTML = `<div class="result-summary fail">Error: ${escapeHtml(err.message)}</div>`;
    }
    e.target.disabled = false;
  });

  document.getElementById('btn-submit').addEventListener('click', async (e) => {
    const user = await requireUser();
    if (!user) { navigate('#/login'); return; }
    e.target.disabled = true;
    document.getElementById('results').innerHTML = '<p>Compiling and running C#...</p>';
    try {
      const submission = await api.submit(slug, editor.getValue());
      const summary = renderResults(submission);
      if (summary) {
        if (submission.xpAwarded > 0) {
          const me = await api.me();
          currentUser = me.user;
          await renderTopbar();
          const xpNote = document.createElement('div');
          xpNote.className = 'result-summary pass';
          xpNote.textContent = submission.leveledUp
            ? `+${submission.xpAwarded} XP! You reached level ${submission.level}.`
            : `+${submission.xpAwarded} XP!`;
          document.getElementById('results').prepend(xpNote);
        } else if (submission.status === 'Accepted') {
          const note = document.createElement('div');
          note.className = 'result-summary';
          note.textContent = 'Already solved -- no additional XP for repeat submissions.';
          document.getElementById('results').prepend(note);
        }
      }
    } catch (err) {
      document.getElementById('results').innerHTML = `<div class="result-summary fail">Error: ${escapeHtml(err.message)}</div>`;
    }
    e.target.disabled = false;
  });
}

// ---------- Router ----------

async function render() {
  const hash = location.hash || '#/problems';
  const [, path, param] = hash.match(/^#\/([^/]*)\/?(.*)$/) || [null, 'problems', ''];

  if (path === 'login' || path === 'register') {
    if (await requireUser()) { navigate('#/problems'); return; }
    viewAuth(path);
    await renderTopbar();
    return;
  }

  const user = await requireUser();
  if (!user) { navigate('#/login'); return; }
  await renderTopbar();

  if (path === 'problem' && param) {
    await viewSolve(decodeURIComponent(param));
  } else if (path === 'leaderboard') {
    await viewLeaderboard();
  } else if (path === 'notes') {
    await viewNotes();
  } else {
    await viewProblems();
  }
}

window.addEventListener('hashchange', render);
render();
