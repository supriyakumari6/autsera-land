# 🌈 Autsera Land — Complete Developer Guide

## ⚡ Quick start (run it on your computer — no accounts, no MongoDB install)

1. Install **Node.js (LTS)** from https://nodejs.org if you don't have it.
2. **Windows:** double-click **`start.bat`**  ·  **Mac/Linux:** run `./start.sh`
   (first run installs packages and downloads a built-in database once, ~150 MB — needs internet, takes a few minutes)
3. When the window says `🚀 Autsera Land is running!`, open **http://localhost:5000**
   (VS Code Live Server on port 5500 also works — but keep the start.bat window open).

**Seeing "The game server is not running"?** The start.bat window is closed or showed an error. Start it again and read the message in that window.
Data is saved in `backend/.data`, so accounts and scores survive restarts. Delete that folder to start fresh.

---


> **aut_la2 edition:** adds one-click local start (`start.bat`), automatic server detection and a built-in local database.
> **aut_la edition:** the frontend is now connected to the Node/Express + MongoDB backend.
> Accounts, scores, the leaderboard and parent settings are stored in the database and shared across devices.
> **To deploy, follow [`DEPLOYMENT.md`](DEPLOYMENT.md).** Set the server address in `frontend/js/config.js`.
### ASD Learning Game | Internship Project

---

## 📁 Project Structure

```
autsera-land/
├── frontend/               ← All the visible stuff (55% of project)
│   ├── index.html          ← Main HTML — all screens live here
│   ├── css/
│   │   ├── main.css        ← All styles, layout, components
│   │   └── animations.css  ← Keyframes and animation classes
│   ├── js/
│   │   ├── config.js       ← set API_URL here after deploying the backend
│   │   ├── utils/
│   │   │   ├── storage.js  ← localStorage wrapper (tokens/settings only)
│   │   │   ├── api.js      ← talks to the backend (fetch + JWT)
│   │   │   ├── escape.js   ← esc() — makes user text safe for innerHTML
│   │   │   ├── sound.js    ← Web Audio API sounds (no files needed)
│   │   │   ├── speech.js   ← Text-to-Speech
│   │   │   └── timer.js    ← Countdown/stopwatch
│   │   ├── games/
│   │   │   ├── colors.js   ← Color identification game
│   │   │   ├── shapes.js   ← Shape matching game
│   │   │   ├── memory.js   ← Memory card flip game
│   │   │   └── objects.js  ← Object recognition game
│   │   ├── app.js          ← Screen router, confetti, overlays
│   │   ├── auth.js         ← Child register/login/avatar
│   │   ├── game.js         ← Central game controller (score, lives, timer)
│   │   ├── leaderboard.js  ← Leaderboard display
│   │   └── parentControl.js← Parent dashboard + time limits
│   └── assets/
│       ├── sounds/         ← (optional) place .mp3 files here
│       └── images/         ← (optional) place images here
├── backend/                ← Node.js + Express REST API
│   ├── server.js           ← Entry point
│   ├── .env.example        ← Copy to .env and fill in values
│   ├── package.json
│   ├── models/
│   │   ├── User.js         ← Child user MongoDB schema
│   │   └── Parent.js       ← Parent MongoDB schema
│   ├── routes/
│   │   ├── auth.js         ← POST /login, /register, /avatar
│   │   ├── scores.js       ← POST /save, GET /leaderboard
│   │   ├── progress.js     ← GET /progress
│   │   ├── parent.js       ← Parent login, settings, children
│   │   └── levels.js       ← GET /levels
│   ├── middleware/
│   │   └── auth.js         ← JWT token verification
│   └── controllers/        ← (optional) move logic here as you grow
└── database/
    └── setup.js            ← DB seed/verify script
```

---

## 🚀 HOW TO RUN (Step by Step)

### Step 1 — Run the Frontend (no install needed!)

The frontend is **pure HTML/CSS/JS** — zero build steps.

1. Open VS Code
2. Install extension: **Live Server** (by Ritwick Dey)
3. Open `frontend/index.html`
4. Click **"Go Live"** in bottom status bar
5. Game opens at `http://127.0.0.1:5500`

> ⚠️ **Important:** the game now needs the backend running (see `DEPLOYMENT.md`).
> Only small things stay in the browser: the login token, sound/speech settings and the daily play-time counter.

---

### Step 2 — Run the Backend (optional, for real database)

**Prerequisites:**
- Node.js v18+ → https://nodejs.org
- MongoDB Community → https://www.mongodb.com/try/download/community

```bash
# 1. Go to backend folder
cd autsera-land/backend

# 2. Install packages
npm install

# 3. Create your .env file
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET

# 4. Start the server
npm run dev         # development (auto-restarts)
# or
npm start           # production
```

Server will start at: `http://localhost:5000`  
Test it: open `http://localhost:5000` in your browser — you should see a welcome message.

---

### Step 3 — Set Up Database

```bash
# Make sure MongoDB is running, then:
cd autsera-land/database
node setup.js
```

---

## 🎮 Game Features Overview

| Feature | Where it is |
|---|---|
| Child Register/Login | `js/auth.js` |
| Avatar Selection (12 avatars) | `js/auth.js` → `buildAvatarGrid()` |
| 4 Mini-Games | `js/games/` folder |
| 3 Difficulty Levels | `js/game.js` → `LEVEL_CONFIG` |
| Sound Effects (Web Audio) | `js/utils/sound.js` |
| Text-to-Speech instructions | `js/utils/speech.js` |
| Score + Lives + Timer HUD | `js/game.js` → `updateHUD()` |
| Streak Bonuses | `js/game.js` → `correctAnswer()` |
| Confetti + Reward Animations | `js/app.js` |
| Star Rating (1-3 ⭐) | `js/game.js` → `endGame()` |
| Leaderboard | `js/leaderboard.js` |
| Parent Login | `js/parentControl.js` |
| Daily Time Limit | `js/parentControl.js` → `startSessionTimer()` |
| Progress Dashboard | `js/parentControl.js` → `showDashboard()` |
| Sound Toggle | `js/utils/sound.js` → `toggle()` |
| Pause / Resume | `js/game.js` → `pause()` / `resume()` |

---

## 🎨 How to Customize

### Add a New Color
In `js/games/colors.js`, add to `ALL_COLORS`:
```js
{ name: 'Teal', hex: '#008080' },
```

### Add a New Shape
In `js/games/shapes.js`, add to `SHAPES`:
```js
{
  name: 'Hexagon',
  color: '#3498DB',
  svg: `<svg viewBox="0 0 80 80"><polygon points="40,4 72,22 72,58 40,76 8,58 8,22" fill="FILL"/></svg>`,
},
```

### Add New Objects
In `js/games/objects.js`, add to any category in `CATEGORIES`:
```js
animals: [
  ...existing,
  { name: 'Crocodile', emoji: '🐊' },
]
```

### Add a New Avatar
In `js/auth.js`, add to `AVATARS`:
```js
{ emoji: '🦊', name: 'Fox' },
```

### Change Difficulty Settings
In `js/game.js`, edit `LEVEL_CONFIG`:
```js
const LEVEL_CONFIG = {
  easy:   { questions: 6,  timer: null, lives: 3, scorePerQ: 10 },
  medium: { questions: 10, timer: 30,   lives: 3, scorePerQ: 15 },
  hard:   { questions: 14, timer: 20,   lives: 2, scorePerQ: 20 },
};
```

---

## 🔌 Backend API Reference

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new child |
| POST | `/api/auth/login` | No | Child login |
| PATCH | `/api/auth/avatar` | JWT | Save avatar |
| POST | `/api/scores/save` | JWT | Save game score |
| GET | `/api/scores/leaderboard?game=all` | No | Get leaderboard |
| GET | `/api/progress` | JWT | Get child progress |
| POST | `/api/parent/register` | No | Parent register |
| POST | `/api/parent/login` | No | Parent login |
| PATCH | `/api/parent/settings` | JWT | Update time limit |
| GET | `/api/parent/children` | JWT | Get children data |
| GET | `/api/levels` | No | Get level config |

### Example API call (connect frontend to backend):
```js
// In auth.js login() function, replace Storage calls with:
const res = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, password }),
});
const data = await res.json();
if (data.token) localStorage.setItem('token', data.token);
```

---

## 📱 Screen Flow

```
Home Screen
  ├── Let's Play!
  │     ├── I have account → Login → Activities
  │     └── I'm new → Register → Avatar Selection → Activities
  │           └── Activities
  │                 ├── Colors → Level Select → Game → Score
  │                 ├── Shapes → Level Select → Game → Score
  │                 ├── Memory → Level Select → Game → Score
  │                 └── Objects → Level Select → Game → Score
  │                       └── (each game) → Leaderboard
  └── Parent Zone → Parent Login → Dashboard
                          ├── Progress Tab
                          ├── Time Limit Tab
                          └── Children Tab
```

---

## 🧩 Technologies Used

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Sounds | Web Audio API (no files needed) |
| Speech | Web Speech API (built into browser) |
| Storage | localStorage (frontend) / MongoDB (backend) |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcryptjs |

---

## 📊 Project Completion Checklist

- [x] Color Identification game
- [x] Shape Matching game
- [x] Memory Card game
- [x] Object Recognition game
- [x] Easy / Medium / Hard levels
- [x] Child-friendly UI (large buttons, bright colours, cartoon feel)
- [x] Sound effects (correct, wrong, level up, celebrate)
- [x] Visual rewards (stars, confetti, emoji)
- [x] Text-to-Speech instructions
- [x] User Registration + Login
- [x] Avatar Selection (12 characters)
- [x] Leaderboard (per-game + overall)
- [x] Parental controls (login, time limit, progress review)
- [x] Score tracking + streak bonus
- [x] Lives system
- [x] Countdown timer (medium/hard)
- [x] Pause / Resume
- [x] Sound toggle
- [x] Backend REST API
- [x] MongoDB schemas
- [x] JWT authentication

---

## 💡 Tips for Your Internship Presentation

1. **Demo the frontend first** — it works without the backend and is more visual
2. **Show the 4 different games** and the difficulty progression
3. **Show the Parent Dashboard** — explains the parental control feature
4. **Show the Leaderboard** — after creating 2-3 demo accounts
5. **Explain the folder structure** using the diagram above
6. **Talk about accessibility** — large buttons, TTS, high contrast design

---

*Built with ❤️ for children with ASD. Every child learns differently — this game meets them where they are.*
