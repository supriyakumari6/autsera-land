# Autsera Land

A game for children, with a parent zone for tracking progress and play-time limits.

Live- "https://autsera-land.onrender.com"

## Tech stack

| Part | Technology | Hosted on |
|   ---|         ---|        ---|
| Frontend | HTML, CSS, JavaScript | Netlify |
| Backend | Node.js, Express.js (REST API, JWT auth) | Render |
| Database | MongoDB Atlas (via Mongoose) | MongoDB Atlas |

The frontend calls the backend API, and the backend reads and writes to MongoDB Atlas.

## Run locally

1. Install [Node.js LTS](https://nodejs.org).
2. Start the server:
   - Windows: double-click `start.bat`
3. Open http://localhost:5000

The first run installs packages and downloaded a built-in database (~150 MB), so it needs internet and takes a few minutes. Keep the start window open while playing.

Data is saved in `backend/.data`. 

To use your own MongoDB instead:
```bash
cd backend
npm install
cp .env.example .env    # Where we set MONGO_URI and JWT_SECRET
npm start
```

## Deploy

All three services have free tiers.

### 1. Database: MongoDB Atlas
1. Create a free M0 cluster.
2. Database Access: add a user.
3. Network Access: allow `0.0.0.0/0` (Render's IPs change).
4. Copy the connection string and add the database name:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/autsera_land`

### 2. Backend: Render
1. Push the project to GitHub.
2. On Render, create a **Web Service** from the repo.
3. Set Root Directory to `backend`, Build Command to `npm install`, Start Command to `npm start`.
4. Add environment variables:

   | Name | Value |
   |---|---|
   | `MONGO_URI` | your Atlas string |
   | `JWT_SECRET` | a long random string |
   | `CLIENT_ORIGIN` | `https://autseraland.netlify.app` |

5. Deploy. `/api/health` confirms the API is running.


### 3. Frontend: Netlify
1. In `frontend/js/config.js`, set `PRODUCTION_API_URL` to your Render URL (no trailing slash).
2. On Netlify, connect the GitHub repo and set the publish directory to `frontend` (or drag the `frontend` folder into the Deploys page).
3. Hard refresh the site with `Ctrl+Shift+R`.

### Updating the live site
Push to GitHub and both Render and Netlify redeploy automatically:
```bash
git add .
git commit -m "Your message"
git push
```

