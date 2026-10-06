/**
 * routes/auth.js — POST /api/auth/register, /login, PATCH /avatar
 */
const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const { handleError, NAME_RE } = require('../utils/respond');
const router  = express.Router();

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function publicUser(u) {
  return { id: u._id, name: u.name, age: u.age, avatar: u.avatar, totalScore: u.totalScore, scores: u.scores };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const name     = String(req.body.name || '').trim();
    const password = String(req.body.password || '');
    const age      = parseInt(req.body.age, 10);

    if (!NAME_RE.test(name))
      return res.status(400).json({ error: 'Name must be 2–20 letters or numbers.' });
    if (!age || age < 2 || age > 8)
      return res.status(400).json({ error: 'Age must be between 3 and 18.' });
    if (password.length < 3 || password.length > 72)
      return res.status(400).json({ error: 'Password needs at least 3 characters.' });

    if (await User.findOne({ nameKey: name.toLowerCase() }))
      return res.status(400).json({ error: 'That name is already taken!' });

    const user = await User.create({ name, age, password });   // password is hashed by the model
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) { handleError(res, err); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const name     = String(req.body.name || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name || !password) return res.status(400).json({ error: 'Name and password required.' });

    const user = await User.findOne({ nameKey: name });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: 'Name or password is incorrect.' });

    res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) { handleError(res, err); }
});

// PATCH /api/auth/avatar
router.patch('/avatar', protect, async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar || typeof avatar.emoji !== 'string' || typeof avatar.name !== 'string' ||
        avatar.emoji.length > 8 || avatar.name.length > 20)
      return res.status(400).json({ error: 'Invalid avatar.' });
    req.user.avatar = { emoji: avatar.emoji, name: avatar.name };
    await req.user.save();
    res.json({ avatar: req.user.avatar });
  } catch (err) { handleError(res, err); }
});

module.exports = router;
