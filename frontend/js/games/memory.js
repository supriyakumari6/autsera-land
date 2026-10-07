
const MemoryGame = (() => {

  const EMOJIS = [
    '🍎','🐶','🚗','⭐','🌙','🍦','🎈','🌈',
    '🐸','🦁','🐧','🐻','🍕','🎸','🚀','🌸',
    '🦋','🐬','🍊','🧁','🎯','🔮','🦀','🌵',
  ];

  const GRID_CONFIG = {
    easy:   { pairs: 6,  cols: 4 },
    medium: { pairs: 8,  cols: 4 },
    hard:   { pairs: 10, cols: 5 },
  };

  let _cards      = [];
  let _flipped    = [];
  let _matched    = 0;
  let _attempts   = 0;
  let _locked     = false;
  let _level      = null;
  let _totalPairs = 0;

  function render(level) {
    _level   = level;
    const cfg = GRID_CONFIG[level];
    _totalPairs = cfg.pairs;
    _matched   = 0;
    _attempts  = 0;
    _flipped   = [];
    _locked    = false;

    
    const chosen = _shuffle([...EMOJIS]).slice(0, cfg.pairs);
    _cards = _shuffle([...chosen, ...chosen]).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));

    document.getElementById('game-question').textContent =
      `🧠 Find all matching pairs! Flip the cards!`;

    const area = document.getElementById('game-area');
    area.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding-bottom:16px;">
        <p style="font-weight:700;color:var(--clr-muted)">Pairs found: <span id="pairs-found">0</span> / ${_totalPairs}</p>
        <div class="memory-grid ${level}" id="memory-grid">${_buildCards()}</div>
      </div>`;

    
    document.querySelectorAll('.mem-card').forEach(card => {
      card.addEventListener('click', () => flipCard(parseInt(card.dataset.id)));
    });

    Speech.speak('Flip the cards and find the matching pairs!');
  }

  function _buildCards() {
    return _cards.map(c => `
      <div class="mem-card" data-id="${c.id}" aria-label="Card">
        <div class="mem-card-inner">
          <div class="mem-card-front">?</div>
          <div class="mem-card-back">${c.emoji}</div>
        </div>
      </div>`).join('');
  }

  function flipCard(id) {
    if (_locked) return;
    const card = _cards[id];
    if (card.flipped || card.matched) return;

    card.flipped = true;
    _flipped.push(id);
    document.querySelector(`.mem-card[data-id="${id}"]`).classList.add('flipped');
    Sound.click();

    if (_flipped.length === 2) {
      _locked = true;
      _attempts++;
      const [a, b] = _flipped;
      if (_cards[a].emoji === _cards[b].emoji) {
        // Match!
        setTimeout(() => {
          _cards[a].matched = true;
          _cards[b].matched = true;
          document.querySelector(`.mem-card[data-id="${a}"]`).classList.add('matched');
          document.querySelector(`.mem-card[data-id="${b}"]`).classList.add('matched');
          _matched++;
          document.getElementById('pairs-found').textContent = _matched;
          _flipped = [];
          _locked  = false;
          Sound.correct();
          if (_matched === _totalPairs) _onComplete();
        }, 400);
      } else {
        // No match
        setTimeout(() => {
          _cards[a].flipped = false;
          _cards[b].flipped = false;
          document.querySelector(`.mem-card[data-id="${a}"]`).classList.remove('flipped');
          document.querySelector(`.mem-card[data-id="${b}"]`).classList.remove('flipped');
          _flipped = [];
          _locked  = false;
          Sound.wrong();
        }, 1000);
      }
    }
  }

  function _onComplete() {
    
    const ideal = _totalPairs;
    const extra = Math.max(0, _attempts - ideal);
    const bonus = Math.max(0, 30 - extra * 2);
    const pts   = _totalPairs * 10 + bonus;
    Sound.celebrate();
    App.confetti(50);
    App.showReward('🧠', `All pairs found in ${_attempts} flips!`, 2000);
    setTimeout(() => Game.correctAnswer(pts), 2200);
  }

  function _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  return { render };
})();
