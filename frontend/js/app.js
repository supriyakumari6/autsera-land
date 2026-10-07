
const App = (() => {
  let _current = 'screen-home';

  function goTo(screenId) {
    Sound.click();
    const all = document.querySelectorAll('.screen');
    all.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      _current = screenId;
    } else {
      console.warn('Screen not found:', screenId);
    }
  }

  function current() { return _current; }

  
  function confetti(count = 60) {
    const colors = ['#FF6B6B','#FFE066','#9B59F5','#3ECFB2','#FF78C4','#4A90D9','#FF9F43'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: -20px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration: ${1.5 + Math.random() * 2}s;
        animation-delay: ${Math.random() * 0.6}s;
        transform: rotate(${Math.random() * 360}deg);
      `;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }

  
  function showReward(emoji, text, duration = 2000) {
    const overlay = document.getElementById('reward-overlay');
    document.getElementById('reward-emoji').textContent = emoji;
    document.getElementById('reward-text').textContent  = text;
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('hidden'), duration);
  }

  
  function showTimeWarning() {
    const el = document.getElementById('time-warning');
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
  }

  
  async function checkServer() {
    let bar = document.getElementById('server-banner');
    const ok = await Api.ping();
    if (ok) { if (bar) bar.remove(); return true; }
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'server-banner';
      bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;padding:10px 14px;text-align:center;' +
        'background:#ffe0e0;color:#b3261e;font:700 .9rem/1.3 Nunito,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.15)';
      document.body.appendChild(bar);
    }
    bar.innerHTML = '';
    bar.append('⚠️ ' + Api.offlineMessage + ' ');
    const btn = document.createElement('button');
    btn.textContent = 'Retry 🔄';
    btn.style.cssText = 'margin-left:8px;padding:4px 10px;border-radius:8px;border:0;font-weight:800;cursor:pointer';
    btn.onclick = checkServer;
    bar.appendChild(btn);
    return false;
  }

 
  function init() {
    Sound.init();
    checkServer();                                
    const user = Storage.get('current_user');
    if (user && Storage.get('token')) {
      Auth.refreshPlayerInfo();
      goTo('screen-activities');
      Auth.syncProfile();                         
    } else {
      goTo('screen-home');
    }
    ParentControl.checkTimeLimitLoop();
  }

  return { goTo, current, confetti, showReward, showTimeWarning, checkServer, init };
})();

window.addEventListener('DOMContentLoaded', () => App.init());
