/**
 * sound.js — Web Audio API–based sound effects
 * No external files needed; all sounds are synthesised.
 */
const Sound = (() => {
  let ctx = null;
  let enabled = Storage.get('sound_enabled', true);

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, type, duration, vol = 0.3, delay = 0) {
    if (!enabled) return;
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime + delay);
      gain.gain.setValueAtTime(vol, c.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
      osc.start(c.currentTime + delay);
      osc.stop(c.currentTime + delay + duration);
    } catch(e) { /* AudioContext blocked */ }
  }

  function correct() {
    tone(523, 'sine', 0.12, 0.28);
    tone(659, 'sine', 0.12, 0.25, 0.12);
    tone(784, 'sine', 0.22, 0.3, 0.24);
  }

  function wrong() {
    tone(330, 'sawtooth', 0.08, 0.25);
    tone(220, 'sawtooth', 0.18, 0.22, 0.09);
  }

  function levelUp() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', 0.15, 0.3, i * 0.13));
  }

  function click() { tone(800, 'sine', 0.06, 0.15); }

  function celebrate() {
    [523, 587, 659, 698, 784, 880, 988, 1047]
      .forEach((f, i) => tone(f, 'sine', 0.18, 0.28, i * 0.08));
  }

  function toggle() {
    enabled = !enabled;
    Storage.set('sound_enabled', enabled);
    document.getElementById('soundToggle').textContent = enabled ? '🔊' : '🔇';
    return enabled;
  }

  function init() {
    enabled = Storage.get('sound_enabled', true);
    document.getElementById('soundToggle').textContent = enabled ? '🔊' : '🔇';
    document.getElementById('soundToggle').addEventListener('click', () => { toggle(); click(); });
  }

  return { correct, wrong, levelUp, click, celebrate, toggle, init };
})();
