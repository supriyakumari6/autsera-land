
const ObjectGame = (() => {

  const CATEGORIES = {
    animals: [
      { name: 'Dog',      emoji: '🐶' },
      { name: 'Cat',      emoji: '🐱' },
      { name: 'Elephant', emoji: '🐘' },
      { name: 'Lion',     emoji: '🦁' },
      { name: 'Monkey',   emoji: '🐒' },
      { name: 'Bird',     emoji: '🐦' },
      { name: 'Fish',     emoji: '🐟' },
      { name: 'Rabbit',   emoji: '🐰' },
      { name: 'Bear',     emoji: '🐻' },
      { name: 'Horse',    emoji: '🐴' },
    ],
    fruits: [
      { name: 'Apple',      emoji: '🍎' },
      { name: 'Banana',     emoji: '🍌' },
      { name: 'Orange',     emoji: '🍊' },
      { name: 'Grapes',     emoji: '🍇' },
      { name: 'Watermelon', emoji: '🍉' },
      { name: 'Strawberry', emoji: '🍓' },
      { name: 'Mango',      emoji: '🥭' },
      { name: 'Pineapple',  emoji: '🍍' },
    ],
    vehicles: [
      { name: 'Car',        emoji: '🚗' },
      { name: 'Bus',        emoji: '🚌' },
      { name: 'Bicycle',    emoji: '🚲' },
      { name: 'Airplane',   emoji: '✈️' },
      { name: 'Boat',       emoji: '⛵' },
      { name: 'Train',      emoji: '🚂' },
      { name: 'Truck',      emoji: '🚚' },
      { name: 'Helicopter', emoji: '🚁' },
    ],
    household: [
      { name: 'Chair',  emoji: '🪑' },
      { name: 'Table',  emoji: '🛋️' },
      { name: 'Book',   emoji: '📚' },
      { name: 'Phone',  emoji: '📱' },
      { name: 'Clock',  emoji: '🕐' },
      { name: 'Lamp',   emoji: '💡' },
      { name: 'Pencil', emoji: '✏️' },
      { name: 'Ball',   emoji: '⚽' },
    ],
  };

  const CAT_LABELS = {
    animals: 'Animals 🐾',
    fruits:  'Fruits 🍎',
    vehicles:'Vehicles 🚗',
    household:'Household 🏠',
  };

  const POOL_SIZES = { easy: 3, medium: 4, hard: 5 };

  let _target = null;

  function render(level) {
    
    const catKeys = Object.keys(CATEGORIES);
    const catKey  = catKeys[Math.floor(Math.random() * catKeys.length)];
    const pool    = CATEGORIES[catKey];
    const count   = POOL_SIZES[level];

    const shuffled = _shuffle([...pool]).slice(0, count);
    _target = shuffled[0];
    const options = _shuffle(shuffled);

    document.getElementById('game-question').textContent =
      `${CAT_LABELS[catKey]} — Find the right one! 👇`;

    const area = document.getElementById('game-area');
    area.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:20px;">
        <div class="object-target">
          <span class="obj-prompt-emoji">${_target.emoji}</span>
          <p class="obj-prompt-text">Tap the <strong>${_target.name}</strong></p>
        </div>
        <div class="object-options">
          ${options.map(obj => `
            <button class="object-btn" onclick="ObjectGame.check('${obj.name}')" data-obj="${obj.name}" aria-label="${obj.name}">
              <span class="obj-emoji">${obj.emoji}</span>
              <span class="obj-name">${obj.name}</span>
            </button>`).join('')}
        </div>
      </div>`;

    Speech.speak(`Tap the ${_target.name}!`);
  }

  function check(selected) {
    const btns = document.querySelectorAll('.object-btn');
    btns.forEach(b => b.disabled = true);
    if (selected === _target.name) {
      document.querySelector(`.object-btn[data-obj="${selected}"]`).classList.add('correct-flash');
      Game.correctAnswer();
    } else {
      document.querySelector(`.object-btn[data-obj="${selected}"]`).classList.add('wrong-flash');
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

  return { render, check };
})();
