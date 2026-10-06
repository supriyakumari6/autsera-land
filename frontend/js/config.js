/**
 * config.js — where the game finds its server. Most people never need to edit this.
 *
 *  • Opened from the server        (http://localhost:5000)         → works automatically
 *  • Opened with Live Server / file (127.0.0.1:5500, file://)      → uses http://localhost:5000 automatically
 *  • Deployed website (Netlify etc.) → set PRODUCTION_API_URL below to your Render address
 *    (if the backend also serves the game, e.g. https://xxx.onrender.com, leave it empty)
 */
window.AUTSERA_CONFIG = {
  PRODUCTION_API_URL: '',          // e.g. 'https://autsera-land.onrender.com'   (no trailing slash)
  LOCAL_API_PORT: 5000,
};
