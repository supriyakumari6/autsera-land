
const Auth = (() => {

  const AVATARS = [
    { emoji: '🦁', name: 'Leo'     },
    { emoji: '🐼', name: 'Panda'   },
    { emoji: '🐸', name: 'Froggy'  },
    { emoji: '🦊', name: 'Fox'     },
    { emoji: '🐧', name: 'Penguin' },
    { emoji: '🦄', name: 'Unicorn' },
    { emoji: '🐶', name: 'Puppy'   },
    { emoji: '🐱', name: 'Kitty'   },
    { emoji: '🐰', name: 'Bunny'   },
    { emoji: '🐻', name: 'Teddy'   },
    { emoji: '🐯', name: 'Tiger'   },
    { emoji: '🦋', name: 'Flutter' },
  ];

  const NAME_RE = /^[\p{L}\p{N} _-]{2,20}$/u;

  let _selectedAvatar = null;
  let _pendingUser    = null;
  let _busy           = false;

  function showError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3500);
  }

  
  async function register() {
    if (_busy) return;
    const name = document.getElementById('reg-name').value.trim();
    const age  = parseInt(document.getElementById('reg-age').value);
    const pass = document.getElementById('reg-pass').value.trim();

    if (!NAME_RE.test(name))         return showError('reg-error', '⚠️ Name must be 2–20 letters or numbers!');
    if (!age || age < 2 || age > 8) return showError('reg-error', '⚠️ Please enter your age (2–8)!');
    if (!pass || pass.length < 3)    return showError('reg-error', '⚠️ Password needs at least 3 characters!');

    _busy = true;
    try {
      const data = await Api.post('/api/auth/register', { name, age, password: pass });
      Storage.set('token', data.token);
      _pendingUser = data.user;
      buildAvatarGrid();
      App.goTo('screen-avatar');
      Speech.speak(`Hi ${name}! Now pick your favourite character!`);
    } catch (e) {
      showError('reg-error', '⚠️ ' + e.message);
    } finally { _busy = false; }
  }

  
  async function login() {
    if (_busy) return;
    const name = document.getElementById('login-name').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    if (!name) return showError('login-error', '⚠️ Please type your name!');
    if (!pass) return showError('login-error', '⚠️ Please type your password!');

    _busy = true;
    try {
      const data = await Api.post('/api/auth/login', { name, password: pass });
      Storage.set('token', data.token);
      _setCurrentUser(data.user);
      ParentControl.startSessionTimer();
      App.goTo('screen-activities');
      Speech.speak(`Welcome back, ${data.user.name}!`);
    } catch (e) {
      showError('login-error', '⚠️ ' + e.message);
    } finally { _busy = false; }
  }

  
  function buildAvatarGrid() {
    _selectedAvatar = null;
    document.getElementById('avatar-confirm-btn').disabled = true;
    const grid = document.getElementById('avatar-grid');
    grid.innerHTML = '';
    AVATARS.forEach(av => {
      const div = document.createElement('div');
      div.className = 'avatar-item';
      div.innerHTML = `<span class="av-emoji">${av.emoji}</span><span class="av-name">${av.name}</span>`;
      div.addEventListener('click', () => {
        document.querySelectorAll('.avatar-item').forEach(a => a.classList.remove('selected'));
        div.classList.add('selected');
        _selectedAvatar = av;
        document.getElementById('avatar-confirm-btn').disabled = false;
        Sound.click();
      });
      grid.appendChild(div);
    });
  }

  async function confirmAvatar() {
    if (!_selectedAvatar || !_pendingUser || _busy) return;
    _busy = true;
    try {
      const r = await Api.patch('/api/auth/avatar', { avatar: _selectedAvatar }, 'child');
      _setCurrentUser({ ..._pendingUser, avatar: r.avatar, totalScore: 0, scores: {} });
    } catch (e) {
      _busy = false;
      return App.showReward('⚠️', e.message, 2500);
    }
    _busy = false;

    const name = _pendingUser.name;
    Sound.levelUp();
    App.confetti(50);
    App.showReward(_selectedAvatar.emoji, `You are ${_selectedAvatar.name}!`, 2200);
    setTimeout(() => {
      ParentControl.startSessionTimer();
      App.goTo('screen-activities');
      Speech.speak(`Awesome! Let's start playing, ${name}!`);
    }, 2400);
  }

  
  function logout() {
    Storage.remove('token');
    Storage.remove('current_user');
    Timer.stop();
    ParentControl.stopSessionTimer();
    App.goTo('screen-home');
  }

  
  async function saveScore(gameType, score, level) {
    if (!Storage.get('token')) return;
    try {
      const r = await Api.post('/api/scores/save', { gameType, score, level }, 'child');
      const user = getCurrentUser();
      if (user) _setCurrentUser({ ...user, totalScore: r.totalScore, scores: r.scores });
    } catch (e) {
      if (e.status === 401) logout();
      else console.warn('Could not save score:', e.message);
    }
  }

  
  async function syncProfile() {
    const user = getCurrentUser();
    if (!user || !Storage.get('token')) return;
    try {
      const p = await Api.get('/api/progress', 'child');
      _setCurrentUser({ ...user, name: p.name, age: p.age, avatar: p.avatar, totalScore: p.totalScore, scores: p.scores });
    } catch (e) {
      if (e.status === 401) logout();
    }
  }

  
  function _setCurrentUser(user) {
    Storage.set('current_user', user);   
    refreshPlayerInfo();
  }

  function refreshPlayerInfo() {
    const user = Storage.get('current_user');
    if (!user) return;
    const el = document.getElementById('player-info');
    if (el) {
      el.innerHTML = `
        <span>${user.avatar ? esc(user.avatar.emoji) : '🎮'}</span>
        <span>${esc(user.name)}</span>
        <span style="color:var(--clr-orange);font-family:var(--font-display)">⭐ ${Number(user.totalScore) || 0}</span>
      `;
    }
  }

  function getCurrentUser() { return Storage.get('current_user'); }

  return { register, login, confirmAvatar, logout, refreshPlayerInfo, getCurrentUser,
           saveScore, syncProfile, AVATARS };
})();
