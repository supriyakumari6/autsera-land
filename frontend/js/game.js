/**
 * game.js — Central game controller
 * Coordinates activity selection, levels, scoring, lives, timer, feedback
 */
const Game = (() => {

  // ── State ──
  let state = {
    activity : null,   // 'colors' | 'shapes' | 'memory' | 'objects'
    level    : null,   // 'easy' | 'medium' | 'hard'
    score    : 0,
    lives    : 3,
    streak   : 0,
    question : 0,
    maxQ     : 10,
    paused   : false,
    elapsed  : 0,
  };

  const LEVEL_CONFIG = {
    easy:   { questions: 6,  timer: null,  lives: 3, scorePerQ: 10 },
    medium: { questions: 10, timer: 30,   lives: 3, scorePerQ: 15 },
    hard:   { questions: 14, timer: 20,   lives: 2, scorePerQ: 20 },
  };

  // Memory is one big board per round, so it gets 2 rounds, no countdown and its own max score
  const MEMORY_PAIRS  = { easy: 6, medium: 8, hard: 10 };
  const MEMORY_ROUNDS = 2;
  const isMemory = () => state.activity === 'memory';
  const questionCount = (level) => isMemory() ? MEMORY_ROUNDS : LEVEL_CONFIG[level].questions;
  const countdownFor  = (level) => isMemory() ? null : LEVEL_CONFIG[level].timer;
  const maxPoints     = (level) => isMemory()
      ? MEMORY_ROUNDS * (MEMORY_PAIRS[level] * 10 + 30)
      : LEVEL_CONFIG[level].questions * LEVEL_CONFIG[level].scorePerQ;

  // ── Activity start ──
  function startActivity(activity) {
    state.activity = activity;
    document.getElementById('level-select-title').textContent =
      `Choose Level for ${activity.charAt(0).toUpperCase() + activity.slice(1)} 🎮`;
    App.goTo('screen-level-select');
    Speech.speak(`You chose ${activity}! Pick your level.`);
  }

  function setLevel(level) {
    state.level = level;
    const cfg   = LEVEL_CONFIG[level];
    state.score   = 0;
    state.lives   = cfg.lives;
    state.streak  = 0;
    state.question = 0;
    state.maxQ    = questionCount(level);
    state.paused  = false;
    state.elapsed = 0;

    updateHUD();
    App.goTo('screen-game');
    Sound.levelUp();

    // Start timer if applicable
    if (countdownFor(level)) {
      Timer.start({
        onTick: (s) => { state.elapsed = s; updateTimer(); },
        limit : countdownFor(level),
        onEnd : () => { if (!state.paused) wrongAnswer(true); },
      });
    } else {
      Timer.start({ onTick: (s) => { state.elapsed = s; updateTimer(); } });
    }

    nextQuestion();
    Speech.speak(`${level} level! Let's go!`);
  }

  // ── QUESTION FLOW ──
  function nextQuestion() {
    if (state.question >= state.maxQ) { endGame(); return; }
    state.question++;
    hideFeedback();
    resetTimerIfCountdown();

    switch (state.activity) {
      case 'colors':  ColorGame.render(state.level);  break;
      case 'shapes':  ShapeGame.render(state.level);  break;
      case 'memory':  MemoryGame.render(state.level); break;
      case 'objects': ObjectGame.render(state.level); break;
    }
  }

  // ── ANSWER HANDLERS ──
  function correctAnswer(points) {
    state.streak++;
    const bonus = state.streak >= 3 ? Math.floor(LEVEL_CONFIG[state.level].scorePerQ * 0.5) : 0;
    const pts   = (points || LEVEL_CONFIG[state.level].scorePerQ) + bonus;
    state.score += pts;
    updateHUD();
    Sound.correct();
    showFeedback(true, bonus > 0 ? `🔥 ${pts} pts! Streak x${state.streak}!` : `✅ ${pts} pts!`);
    Speech.speak(bonus > 0 ? 'Amazing streak!' : 'Great job!');
    if (state.score % 50 === 0 && state.score > 0) App.confetti(30);
    setTimeout(nextQuestion, 1400);
  }

  function wrongAnswer(timeout = false) {
    state.streak = 0;
    state.lives--;
    updateHUD();
    Sound.wrong();
    showFeedback(false, timeout ? '⏰ Too slow!' : '❌ Not quite!');
    Speech.speak('Try again!');
    if (state.lives <= 0) { setTimeout(endGame, 1400); return; }
    setTimeout(nextQuestion, 1600);
  }

  // ── END GAME ──
  function endGame() {
    Timer.stop();
    const maxPts = maxPoints(state.level);
    const pct    = maxPts > 0 ? Math.round((state.score / maxPts) * 100) : 0;
    const stars  = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;

    // save score on the server (history is stored there too)
    Auth.saveScore(state.activity, state.score, state.level);

    // show score screen
    const emoji  = stars === 3 ? '🏆' : stars === 2 ? '🌟' : '😊';
    const title  = stars === 3 ? 'Amazing!!! 🎉' : stars === 2 ? 'Well Done! 👏' : 'Good Try! 😊';
    document.getElementById('score-animation').textContent = emoji;
    document.getElementById('score-title').textContent = title;
    document.getElementById('score-details').innerHTML = `
      Score: <strong>${state.score}</strong> pts<br/>
      Questions: ${state.question} / ${state.maxQ}<br/>
      Activity: ${state.activity.charAt(0).toUpperCase() + state.activity.slice(1)}<br/>
      Level: ${state.level.charAt(0).toUpperCase() + state.level.slice(1)}
    `;
    const starEl = document.getElementById('star-row');
    starEl.innerHTML = Array.from({length: 3}, (_, i) =>
      `<span class="star-anim" style="opacity:${i < stars ? 1 : 0.2}">${i < stars ? '⭐' : '☆'}</span>`
    ).join('');

    App.goTo('screen-score');
    if (stars === 3) { Sound.celebrate(); App.confetti(80); }
    else Sound.levelUp();
    Speech.speak(title.replace('!!!', '').replace('!', ''));
  }

  // ── HUD ──
  function updateHUD() {
    document.getElementById('stat-score').textContent = `⭐ ${state.score}`;
    document.getElementById('stat-lives').textContent = '❤️'.repeat(state.lives) + '🖤'.repeat(Math.max(0, 3 - state.lives));
  }
  function updateTimer() {
    const secs = state.level ? countdownFor(state.level) : null;
    if (secs) {
      const remaining = secs - state.elapsed;
      document.getElementById('stat-timer').textContent = `⏱ ${Math.max(0, remaining)}s`;
    } else {
      document.getElementById('stat-timer').textContent = `⏱ ${state.elapsed}s`;
    }
  }

  // ── FEEDBACK ──
  function showFeedback(correct, msg) {
    const el = document.getElementById('game-feedback');
    el.className = `game-feedback ${correct ? 'correct' : 'wrong'}`;
    el.textContent = msg;
    el.classList.remove('hidden');
  }
  function hideFeedback() {
    const el = document.getElementById('game-feedback');
    el.classList.add('hidden');
  }

  function resetTimerIfCountdown() {
    const secs = countdownFor(state.level);
    if (secs) {
      Timer.stop();
      state.elapsed = 0;
      Timer.start({
        onTick: (s) => { state.elapsed = s; updateTimer(); },
        limit : secs,
        onEnd : () => { if (!state.paused) wrongAnswer(true); },
      });
    }
  }

  // ── PAUSE / RESUME ──
  function pause() {
    state.paused = true;
    Timer.pause();
    App.goTo('screen-pause');
  }
  function resume() {
    state.paused = false;
    Timer.resume({ onTick: (s) => { state.elapsed = s; updateTimer(); } });
    App.goTo('screen-game');
  }
  function restart() {
    App.goTo('screen-game');
    setLevel(state.level);
  }
  function exitGame() {
    Timer.stop();
    App.goTo('screen-activities');
  }
  function playAgain() { setLevel(state.level); }

  // ── GETTERS for sub-games ──
  function getLevel()   { return state.level; }
  function getActivity(){ return state.activity; }

  return { startActivity, setLevel, correctAnswer, wrongAnswer, pause, resume,
           restart, exitGame, playAgain, getLevel, getActivity, nextQuestion };
})();
