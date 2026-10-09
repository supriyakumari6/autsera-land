
const express = require('express');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const { handleError } = require('../utils/respond');
const router  = express.Router();

const GAMES  = ['colors', 'shapes', 'memory', 'objects'];
const LEVELS = ['easy', 'medium', 'hard'];
const MAX_SCORE_PER_GAME = 1000;   // sanity cap so nobody can post a fake huge score

router.post('/save', protect, async (req, res) => {
  try {
    const { gameType, level } = req.body;
    const score = Math.round(Number(req.body.score));
    if (!GAMES.includes(gameType))  return res.status(400).json({ error: 'Unknown game.' });
    if (!LEVELS.includes(level))    return res.status(400).json({ error: 'Unknown level.' });
    if (!Number.isFinite(score) || score < 0 || score > MAX_SCORE_PER_GAME)
      return res.status(400).json({ error: 'Invalid score.' });

    const user = req.user;
    user.scores[gameType] = (user.scores[gameType] || 0) + score;
    user.totalScore       = (user.totalScore || 0) + score;
    user.history.push({ gameType, score, level });
    if (user.history.length > 200) user.history = user.history.slice(-200);
    await user.save();

    res.json({ totalScore: user.totalScore, gameScore: user.scores[gameType], scores: user.scores });
  } catch (err) { handleError(res, err); }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const game  = GAMES.includes(req.query.game) ? req.query.game : 'all';
    const users = await User.find({}).select('name avatar scores totalScore').lean();
    const entries = users.map(u => ({
      id:     u._id,
      name:   u.name,
      avatar: u.avatar,
      score:  game === 'all' ? (u.totalScore || 0) : ((u.scores && u.scores[game]) || 0),
    })).sort((a, b) => b.score - a.score).slice(0, 20);
    res.json(entries);
  } catch (err) { handleError(res, err); }
});

module.exports = router;
