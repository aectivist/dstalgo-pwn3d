(function () {
  const STORAGE_KEY = 'dstalgo-theme';
  const THEMES = [
    { id: 'frutiger', label: 'Frutiger Aero', swatch: 'linear-gradient(135deg, #29b6ff, #0d2a55)' },
    { id: 'dark', label: 'Minimalist Dark', swatch: '#1b1c20' },
    { id: 'light', label: 'Minimalist Light', swatch: '#ffffff' },
    { id: 'leetcode', label: 'LeetCode', swatch: '#ffa116' },
  ];
  const THEME_FILES = {
    frutiger: '/css/theme-frutiger.css',
    dark: '/css/theme-dark.css',
    light: '/css/theme-light.css',
    leetcode: '/css/theme-leetcode.css',
  };

  const themeLink = document.getElementById('theme-link');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const themeOptionsEl = document.getElementById('theme-options');

  function getCurrentTheme() {
    try { return localStorage.getItem(STORAGE_KEY) || 'dark'; }
    catch (e) { return 'dark'; }
  }

  function applyTheme(id) {
    themeLink.setAttribute('href', THEME_FILES[id] || THEME_FILES.dark);
    try { localStorage.setItem(STORAGE_KEY, id); } catch (e) { /* ignore */ }
    renderOptions(id);
  }

  function renderOptions(activeId) {
    themeOptionsEl.innerHTML = THEMES.map(t => `
      <button type="button" class="theme-option ${t.id === activeId ? 'active' : ''}" data-theme="${t.id}">
        <span class="theme-swatch" style="background:${t.swatch}"></span>
        ${t.label}
        <span class="check">&#10003;</span>
      </button>
    `).join('');
    themeOptionsEl.querySelectorAll('.theme-option').forEach(btn => {
      btn.addEventListener('click', () => {
        applyTheme(btn.dataset.theme);
        closePanel();
      });
    });
  }

  function openPanel() { settingsPanel.hidden = false; }
  function closePanel() { settingsPanel.hidden = true; }

  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (settingsPanel.hidden) openPanel(); else closePanel();
  });
  document.addEventListener('click', (e) => {
    if (!settingsPanel.hidden && !settingsPanel.contains(e.target) && e.target !== settingsBtn) {
      closePanel();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  renderOptions(getCurrentTheme());
})();
