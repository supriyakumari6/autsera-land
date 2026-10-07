
const Storage = (() => {
  const NS = 'autsera_';

  function key(k) { return NS + k; }

  function get(k, fallback = null) {
    try {
      const raw = localStorage.getItem(key(k));
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function set(k, val) {
    try { localStorage.setItem(key(k), JSON.stringify(val)); return true; }
    catch { console.warn('Storage.set failed', k); return false; }
  }

  function remove(k) { localStorage.removeItem(key(k)); }

  function clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(NS))
      .forEach(k => localStorage.removeItem(k));
  }

  return { get, set, remove, clear };
})();
