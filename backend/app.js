
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');
const fs        = require('fs');

const app = express();
app.set('trust proxy', 1);                                   


app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const origins = (process.env.CLIENT_ORIGIN || '*').split(',').map(s => s.trim());
app.use(cors({ origin: origins.includes('*') ? '*' : origins }));
app.use(express.json({ limit: '10kb' }));


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes.' },
});


app.get('/api/health', (req, res) => res.json({ ok: true, message: '🌈 Autsera Land API is running!' }));
app.use('/api/auth',     authLimiter, require('./routes/auth'));
app.use('/api/scores',   require('./routes/scores'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/parent',   authLimiter, require('./routes/parent'));
app.use('/api/levels',   require('./routes/levels'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));


const FRONTEND = path.join(__dirname, '..', 'frontend');
if (fs.existsSync(path.join(FRONTEND, 'index.html'))) app.use(express.static(FRONTEND));
else app.get('/', (req, res) => res.json({ message: '🌈 Autsera Land API is running!' }));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

module.exports = app;
