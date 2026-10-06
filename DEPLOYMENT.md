# 🚀 Deploying Autsera Land (aut_la2)

## ⚡ First: run it locally (run it on your computer — no accounts, no MongoDB install)

1. Install **Node.js (LTS)** from https://nodejs.org if you don't have it.
2. **Windows:** double-click **`start.bat`**  ·  **Mac/Linux:** run `./start.sh`
   (first run installs packages and downloads a built-in database once, ~150 MB — needs internet, takes a few minutes)
3. When the window says `🚀 Autsera Land is running!`, open **http://localhost:5000**
   (VS Code Live Server on port 5500 also works — but keep the start.bat window open).

**Seeing "The game server is not running"?** The start.bat window is closed or showed an error. Start it again and read the message in that window.
Data is saved in `backend/.data`, so accounts and scores survive restarts. Delete that folder to start fresh.

---


Three pieces: **MongoDB Atlas** (database) → **Render** (backend API) → **Netlify** (frontend). All have free tiers.

## 1. Database — MongoDB Atlas
1. Create a free account at https://www.mongodb.com/atlas and create a free **M0** cluster.
2. **Database Access** → add a user (username + password).
3. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere — required for Render's changing IPs).
4. **Connect → Drivers** → copy the connection string and put your database name in it:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/autsera_land`

## 2. Backend — Render
1. Push the **whole `aut_la` folder** to a GitHub repo (the `.gitignore` already keeps `.env` and `node_modules` out).
2. On https://render.com → **New → Web Service** → pick the repo.
3. Settings: **Root Directory** `backend` · **Build Command** `npm install` · **Start Command** `npm start`
4. **Environment Variables**:
   | Name | Value |
   |---|---|
   | `MONGO_URI` | your Atlas string from step 1 |
   | `JWT_SECRET` | a long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
   | `CLIENT_ORIGIN` | `https://autseraland.netlify.app` |
5. Deploy. Open `https://YOUR-SERVICE.onrender.com` — **the game itself opens there** (the backend also serves the frontend), and `/api/health` shows `Autsera Land API is running`. You can stop here; Netlify is optional.

> Free Render services sleep when idle; the first request after a break can take ~30–60 s. The game pings the server on page load to wake it.

## 3. Frontend on Netlify (optional)
1. Open `frontend/js/config.js` and set `PRODUCTION_API_URL` to your Render address (no trailing slash):
   ```js
   PRODUCTION_API_URL: 'https://YOUR-SERVICE.onrender.com',
   ```
2. In Netlify → **Deploys**, drag the **`frontend` folder** (the one with `index.html` directly inside) onto the drop box.
3. Open https://autseraland.netlify.app and hard-refresh (Ctrl+Shift+R).

## Run locally with your own MongoDB / Atlas instead
```bash
cd backend && npm install && cp .env.example .env   # in .env set MONGO_URI (+ JWT_SECRET)
npm start                                            # game + API on http://localhost:5000
```

## Quick test checklist
- Register a child → pick avatar → play a game → score appears on 🏆 Leaderboard
- Open the site on a **second device/browser**, register another child → both appear on the same leaderboard
- Parent Zone → register → Progress tab lists children → set a time limit
