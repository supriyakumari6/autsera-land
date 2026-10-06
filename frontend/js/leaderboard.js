/**
 * leaderboard.js — shared leaderboard (loaded from the server)
 */
const Leaderboard = (() => {

  async function show(tab = 'all') {
    document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach(b => {
      const label = b.textContent.toLowerCase();
      b.classList.toggle('active', label.includes(tab === 'all' ? 'all' : tab));
    });
    await render(tab);
  }

  async function render(tab) {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '<p style="text-align:center;color:#aaa;padding:24px">Loading… ⏳</p>';

    let entries;
    try {
      entries = await Api.get(`/api/scores/leaderboard?game=${encodeURIComponent(tab)}`);
    } catch (e) {
      list.innerHTML = `<p style="text-align:center;color:#aaa;padding:24px">⚠️ ${esc(e.message)}</p>`;
      return;
    }

    if (!entries.length) {
      list.innerHTML = '<p style="text-align:center;color:#aaa;padding:24px">No scores yet! Be the first! 🌟</p>';
      return;
    }

    const current   = Auth.getCurrentUser();
    const medals    = ['🥇', '🥈', '🥉'];
    const rankClass = ['gold', 'silver', 'bronze'];
    list.innerHTML = entries.map((e, i) => {
      const isMine = current && String(e.id) === String(current.id);
      return `
        <div class="lb-row ${isMine ? 'mine' : ''}">
          <span class="lb-rank ${rankClass[i] || ''}">${medals[i] || (i + 1)}</span>
          <span class="lb-avatar">${e.avatar ? esc(e.avatar.emoji) : '🎮'}</span>
          <span class="lb-name">${esc(e.name)}${isMine ? ' (You!)' : ''}</span>
          <span class="lb-score">⭐ ${Number(e.score) || 0}</span>
        </div>`;
    }).join('');
  }

  function init() { show('all'); }

  return { show, init };
})();
