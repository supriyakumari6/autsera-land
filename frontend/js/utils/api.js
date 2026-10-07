
class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

const Api = (() => {
  const cfg   = window.AUTSERA_CONFIG || {};
  const host  = location.hostname;
  const isLocalHost = location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const localPort   = String(cfg.LOCAL_API_PORT || 5000);

  
  const BASE = (() => {
    if (isLocalHost) {
      if (location.port === localPort) return '';
      return `http://${host && location.protocol !== 'file:' ? host : 'localhost'}:${localPort}`;
    }
    return (cfg.PRODUCTION_API_URL || '').replace(/\/+$/, '');
  })();

  const TOKEN_KEY = { child: 'token', parent: 'parent_token' };

  const OFFLINE_MSG = isLocalHost
    ? 'The game server is not running. Start it with start.bat (or run "npm start" in the backend folder), then try again.'
    : 'Cannot reach the game server. If it was asleep, wait a minute and try again!';

  async function request(method, path, body, as) {
    const headers = { 'Content-Type': 'application/json' };
    const token = as ? Storage.get(TOKEN_KEY[as]) : null;
    if (token) headers.Authorization = 'Bearer ' + token;

    let res;
    try {
      res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    } catch {
      throw new ApiError(OFFLINE_MSG, 0);
    }

    let data = null;
    try { data = await res.json(); } catch { /* not JSON */ }
    if (!res.ok) {
      if (data === null) throw new ApiError(
        'The game server did not answer correctly. Check PRODUCTION_API_URL in js/config.js.', res.status);
      throw new ApiError(data.error || 'Something went wrong.', res.status);
    }
    return data;
  }

  
  async function ping() {
    try { const r = await fetch(BASE + '/api/health'); return r.ok; }
    catch { return false; }
  }

  return {
    get:   (path, as)       => request('GET',   path, null, as),
    post:  (path, body, as) => request('POST',  path, body, as),
    patch: (path, body, as) => request('PATCH', path, body, as),
    ping, offlineMessage: OFFLINE_MSG,
  };
})();
