
const ShapeGame = (() => {

  const SHAPES = [
    {
      name: 'Circle',
      color: '#E74C3C',
      svg: `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="FILL" stroke="none"/></svg>`,
    },
    {
      name: 'Square',
      color: '#3498DB',
      svg: `<svg viewBox="0 0 80 80"><rect x="8" y="8" width="64" height="64" rx="6" fill="FILL"/></svg>`,
    },
    {
      name: 'Triangle',
      color: '#2ECC71',
      svg: `<svg viewBox="0 0 80 80"><polygon points="40,6 74,74 6,74" fill="FILL"/></svg>`,
    },
    {
      name: 'Rectangle',
      color: '#9B59B6',
      svg: `<svg viewBox="0 0 80 80"><rect x="4" y="20" width="72" height="40" rx="6" fill="FILL"/></svg>`,
    },
    {
      name: 'Star',
      color: '#F39C12',
      svg: `<svg viewBox="0 0 80 80"><polygon points="40,5 49,30 76,30 54,47 63,73 40,56 17,73 26,47 4,30 31,30" fill="FILL"/></svg>`,
    },
    {
      name: 'Diamond',
      color: '#1ABC9C',
      svg: `<svg viewBox="0 0 80 80"><polygon points="40,6 74,40 40,74 6,40" fill="FILL"/></svg>`,
    },
    {
      name: 'Heart',
      color: '#E91E63',
      svg: `<svg viewBox="0 0 80 80"><path d="M40 68 C40 68 8 50 8 28 C8 16 18 10 28 12 C34 14 38 18 40 22 C42 18 46 14 52 12 C62 10 72 16 72 28 C72 50 40 68 40 68Z" fill="FILL"/></svg>`,
    },
    {
      name: 'Pentagon',
      color: '#FF5722',
      svg: `<svg viewBox="0 0 80 80"><polygon points="40,6 73,28 61,66 19,66 7,28" fill="FILL"/></svg>`,
    },
  ];

  const POOL = {
    easy:   ['Circle','Square','Triangle','Rectangle'],
    medium: ['Circle','Square','Triangle','Rectangle','Star','Diamond'],
    hard:   SHAPES.map(s => s.name),
  };

  let _target = null;

  function _makeSVG(shape, colorOverride) {
    const col = colorOverride || shape.color;
    return shape.svg.replace(/FILL/g, col);
  }

  function render(level) {
    const pool   = POOL[level];
    const count  = level === 'easy' ? 3 : level === 'medium' ? 4 : 5;
    const names  = _shuffle([...pool]).slice(0, count);
    _target      = SHAPES.find(s => s.name === names[0]);
    const options = _shuffle(names);

    document.getElementById('game-question').textContent =
      `🔷 Find this shape! 👇`;

    const area = document.getElementById('game-area');
    area.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:24px;">
        <div class="shape-target">
          ${_makeSVG(_target, _target.color)}
          <span style="font-weight:800;font-size:1rem;color:var(--clr-purple)">${_target.name}</span>
        </div>
        <div class="shape-options">
          ${options.map(name => {
            const sh = SHAPES.find(s => s.name === name);
            // Distractor: same shape name shown but random color to avoid color hints
            const col = _randomColor();
            return `
              <button class="shape-btn" onclick="ShapeGame.check('${name}')" data-shape="${name}" aria-label="${name}">
                ${_makeSVG(sh, col)}
                <span class="shape-name">${name}</span>
              </button>`;
          }).join('')}
        </div>
      </div>`;

    Speech.speak(`Find the ${_target.name}!`);
  }

  function check(selected) {
    const btns = document.querySelectorAll('.shape-btn');
    btns.forEach(b => b.disabled = true);
    if (selected === _target.name) {
      document.querySelector(`.shape-btn[data-shape="${selected}"]`).classList.add('correct-flash');
      Game.correctAnswer();
    } else {
      document.querySelector(`.shape-btn[data-shape="${selected}"]`).classList.add('wrong-flash');
      Game.wrongAnswer();
    }
  }

  function _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function _randomColor() {
    const colors = ['#E74C3C','#3498DB','#2ECC71','#9B59B6','#F39C12','#1ABC9C','#E91E63','#FF5722','#795548','#607D8B'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  return { render, check };
})();
