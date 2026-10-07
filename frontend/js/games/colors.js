
const ColorGame = (() => {

  const ALL_COLORS = [
    { name: 'Red',    hex: '#E74C3C' },
    { name: 'Blue',   hex: '#3498DB' },
    { name: 'Green',  hex: '#2ECC71' },
    { name: 'Yellow', hex: '#F1C40F' },
    { name: 'Orange', hex: '#E67E22' },
    { name: 'Purple', hex: '#9B59B6' },
    { name: 'Pink',   hex: '#FF78C4' },
    { name: 'Brown',  hex: '#8B4513' },
    { name: 'White',  hex: '#ECEBEA', border: '#ccc' },
    { name: 'Black',  hex: '#2C2C2C' },
    { name: 'Cyan',   hex: '#00BCD4' },
    { name: 'Gray',   hex: '#95A5A6' },
  ];

  const POOL = {
    easy:   ['Red','Blue','Green','Yellow','Orange'],
    medium: ['Red','Blue','Green','Yellow','Orange','Purple','Pink'],
    hard:   ALL_COLORS.map(c => c.name),
  };

  let _target = null;

  function render(level) {
    const pool    = POOL[level];
    const count   = level === 'easy' ? 3 : level === 'medium' ? 4 : 5;
    const options = _shuffle([...pool]).slice(0, count);
    _target = ALL_COLORS.find(c => c.name === options[0]);
    const shuffled = _shuffle(options);

    document.getElementById('game-question').textContent =
      `🎨 Tap the colour that looks like this! 👇`;

    const area = document.getElementById('game-area');
    area.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:24px;">
        <div class="color-target-display" style="background:${_target.hex}; ${_target.border ? 'border-color:'+_target.border : ''}"></div>
        <div class="color-options">
          ${shuffled.map(name => {
            const col = ALL_COLORS.find(c => c.name === name);
            return `
              <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
                <button class="color-btn"
                  style="background:${col.hex}; ${col.border ? 'border-color:'+col.border : ''}"
                  onclick="ColorGame.check('${name}')"
                  title="${name}"
                  aria-label="${name}">
                </button>
                <span style="font-weight:800;font-size:0.95rem;color:var(--clr-dark)">${name}</span>
              </div>`;
          }).join('')}
        </div>
      </div>`;

    Speech.speak(`Find the colour ${_target.name}!`);
  }

  function check(selected) {
    const btns = document.querySelectorAll('.color-btn');
    if (selected === _target.name) {
      
      btns.forEach(b => { if (b.title === selected) b.classList.add('correct-flash'); });
      Game.correctAnswer();
    } else {
      btns.forEach(b => { if (b.title === selected) b.classList.add('wrong-flash'); });
      Game.wrongAnswer();
    }
    
    btns.forEach(b => b.disabled = true);
  }

  function _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  return { render, check };
})();
