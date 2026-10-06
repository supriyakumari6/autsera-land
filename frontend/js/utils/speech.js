/**
 * speech.js — Text-to-Speech using Web Speech API
 */
const Speech = (() => {
  const synth = window.speechSynthesis || null;
  let enabled = Storage.get('speech_enabled', true);

  function speak(text, opts = {}) {
    if (!enabled || !synth) return;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate   = opts.rate  || 0.85;
    utt.pitch  = opts.pitch || 1.1;
    utt.volume = opts.volume || 1;
    // prefer a child-friendly voice if available
    const voices = synth.getVoices();
    const prefer  = voices.find(v => v.name.includes('Google') || v.lang.startsWith('en'));
    if (prefer) utt.voice = prefer;
    synth.speak(utt);
  }

  function toggle() {
    enabled = !enabled;
    Storage.set('speech_enabled', enabled);
    if (!enabled && synth) synth.cancel();
    return enabled;
  }

  function isEnabled() { return enabled; }

  return { speak, toggle, isEnabled };
})();
