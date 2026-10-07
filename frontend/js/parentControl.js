
const ParentControl = (() => {

  let _busy = false;

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3500);
  }

  function _enter(data) {
    Storage.set('parent_token', data.token);
    Storage.set('parent_limit', (data.settings && data.settings.dailyLimitMinutes) || 30);
    App.goTo('screen-parent-dashboard');
    showDashboard('progress');
  }

  
  async function register() {
    if (_busy) return;
    const name  = document.getElementById('preg-name').value.trim();
    const email = document.getElementById('preg-email').value.trim().toLowerCase();
    const pass  = document.getElementById('preg-pass').value.trim();

    if (!name)  return showError('preg-error', '⚠️ Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('preg-error', '⚠️ Please enter a valid email.');
    if (!pass || pass.length < 4) return showError('preg-error', '⚠️ Password must be at least 4 characters.');

    _busy = true;
    try {
      _enter(await Api.post('/api/parent/register', { name, email, password: pass }));
    } catch (e) {
      showError('preg-error', '⚠️ ' + e.message);
    } finally { _busy = false; }
  }

  
  async function login() {
    if (_busy) return;
    const email = document.getElementById('parent-email').value.trim().toLowerCase();
    const pass  = document.getElementById('parent-pass').value.trim();

    if (!email) return showError('parent-login-error', '⚠️ Please enter your email.');
    if (!pass)  return showError('parent-login-error', '⚠️ Please enter your password.');

    _busy = true;
    try {
      _enter(await Api.post('/api/parent/login', { email, password: pass }));
    } catch (e) {
      showError('parent-login-error', '⚠️ ' + e.message);
    } finally { _busy = false; }
  }


  function logout() {
    Storage.remove('parent_token');
    App.goTo('screen-home');
  }

  
  function showTab(tab) {
    document.querySelectorAll('.parent-tabs .tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('onclick').includes(tab));
    });
    showDashboard(tab);
  }

  async function showDashboard(tab) {
    const container = document.getElementById('parent-tab-content');
    if (!container) return;

    if (tab === 'time-limit') {
      const limit = Storage.get('parent_limit', 30);
      container.innerHTML = `
        <div class="parent-section time-limit-section">
          <h3>⏰ Daily Play Time Limit</h3>
          <label for="time-slider">Limit: <span class="time-display" id="time-value">${Number(limit)} min</span></label>
          <input type="range" id="time-slider" min="5" max="120" step="5" value="${Number(limit)}"
            oninput="document.getElementById('time-value').textContent=this.value+' min'" />
          <button class="btn btn-primary" onclick="ParentControl.saveTimeLimit()">Save Limit 💾</button>
          <p style="color:var(--clr-muted);font-size:.9rem;margin-top:8px;">
            Children will see a warning when they approach this limit.
          </p>
        </div>`;
      return;
    }

    container.innerHTML = '<div class="parent-section"><p style="color:#aaa">Loading… ⏳</p></div>';
    let users;
    try {
      users = await Api.get('/api/parent/children', 'parent');
    } catch (e) {
      if (e.status === 401) { logout(); return; }
      container.innerHTML = `<div class="parent-section"><p style="color:#aaa">⚠️ ${esc(e.message)}</p></div>`;
      return;
    }

    if (users.length === 0) {
      container.innerHTML = '<div class="parent-section"><p style="color:#aaa">No child accounts found yet.</p></div>';
      return;
    }

    if (tab === 'progress') {
      const games = ['colors', 'shapes', 'memory', 'objects'];
      const gameLabels = { colors: '🎨 Colors', shapes: '🔷 Shapes', memory: '🧠 Memory', objects: '🐘 Objects' };
      container.innerHTML = users.map(u => {
        const sc  = u.scores || {};
        const top = Math.max(100, ...games.map(g => sc[g] || 0));   // bars scale to the child's best game
        const bars = games.map(g => {
          const s = sc[g] || 0;
          return `
            <p style="margin:6px 0 2px;font-size:.9rem;font-weight:700;">${gameLabels[g]} — ${s} pts</p>
            <div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round(s / top * 100)}%"></div></div>`;
        }).join('');
        return `
          <div class="progress-card">
            <h4>${u.avatar ? esc(u.avatar.emoji) : '🎮'} ${esc(u.name)} (Age ${esc(u.age || '?')}) — ⭐ ${Number(u.totalScore) || 0} total</h4>
            ${bars}
          </div>`;
      }).join('');

    } else if (tab === 'children') {
      container.innerHTML = `
        <div class="parent-section">
          <h3>👧 Child Accounts</h3>
          ${users.map(u => `
            <div class="progress-card" style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:2rem">${u.avatar ? esc(u.avatar.emoji) : '🎮'}</span>
              <div>
                <strong>${esc(u.name)}</strong> — Age ${esc(u.age || '?')}<br/>
                <span style="color:var(--clr-muted);font-size:.9rem">Total score: ${Number(u.totalScore) || 0}</span>
              </div>
            </div>`).join('')}
        </div>`;
    }
  }

  async function saveTimeLimit() {
    const slider = document.getElementById('time-slider');
    if (!slider) return;
    const limit = parseInt(slider.value);
    try {
      await Api.patch('/api/parent/settings', { dailyLimitMinutes: limit }, 'parent');
      Storage.set('parent_limit', limit);
      App.showReward('✅', `Time limit set to ${limit} min!`, 1800);
    } catch (e) {
      if (e.status === 401) return logout();
      App.showReward('⚠️', e.message, 2500);
    }
  }

  
  let _interval = null;
  let _runId    = 0;

  async function startSessionTimer() {
    stopSessionTimer();
    const user = Auth.getCurrentUser();
    if (!user) return;
    const run = ++_runId;

    let limitMin = 30;
    try { limitMin = (await Api.get('/api/settings')).dailyLimitMinutes || 30; } catch { /* keep default */ }
    if (run !== _runId) return;                        

    const day      = new Date().toLocaleDateString('en-CA');          
    const key      = `session_${user.id}_${day}`;
    const limitSec = limitMin * 60;
    let seconds    = Storage.get(key, 0);
    let warned     = false;

    _interval = setInterval(() => {
      seconds++;
      Storage.set(key, seconds);
      if (!warned && seconds >= limitSec * 0.9 && seconds < limitSec) { warned = true; App.showTimeWarning(); }
      if (seconds >= limitSec) {
        stopSessionTimer();
        alert('⏰ Time is up for today! Come back tomorrow. 👋');
        Auth.logout();
      }
    }, 1000);
  }

  function stopSessionTimer() {
    _runId++;
    if (_interval) clearInterval(_interval);
    _interval = null;
  }

  function checkTimeLimitLoop() {
    if (Storage.get('current_user')) startSessionTimer();
  }

  return { register, login, logout, showTab, saveTimeLimit,
           startSessionTimer, stopSessionTimer, checkTimeLimitLoop };
})();
