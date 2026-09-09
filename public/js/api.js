const api = {
  async _req(method, url, body) {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  },
  me: () => api._req('GET', '/api/auth/me'),
  login: (username, password) => api._req('POST', '/api/auth/login', { username, password }),
  register: (username, password) => api._req('POST', '/api/auth/register', { username, password }),
  logout: () => api._req('POST', '/api/auth/logout'),
  listProblems: () => api._req('GET', '/api/problems'),
  getProblem: (slug) => api._req('GET', `/api/problems/${encodeURIComponent(slug)}`),
  run: (slug, code) => api._req('POST', `/api/problems/${encodeURIComponent(slug)}/run`, { code }),
  submit: (slug, code) => api._req('POST', `/api/problems/${encodeURIComponent(slug)}/submit`, { code }),
  leaderboard: () => api._req('GET', '/api/leaderboard'),
  notes: () => api._req('GET', '/api/notes'),
};
