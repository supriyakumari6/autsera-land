
const express = require('express');
const jwt     = require('jsonwebtoken');
const Parent  = require('../models/Parent');
const User    = require('../models/User');
const Setting = require('../models/Setting');
const { handleError, NAME_RE, EMAIL_RE } = require('../utils/respond');
const router  = express.Router();

function signParentToken(id) {
  return jwt.sign({ id, role: 'parent' }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function protectParent(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Not authorised.' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role !== 'parent') return res.status(403).json({ error: 'Not a parent account.' });
    req.parent = await Parent.findById(decoded.id).select('-password');
    if (!req.parent) return res.status(401).json({ error: 'Parent not found.' });
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid.' });
  }
}

// POST /api/parent/register
router.post('/register', async (req, res) => {
  try {
    const name     = String(req.body.name || '').trim();
    const email    = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || name.length > 50) return res.status(400).json({ error: 'Please enter your name.' });
    if (!EMAIL_RE.test(email))               return res.status(400).json({ error: 'Please enter a valid email.' });
    if (password.length < 4 || password.length > 72)
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    if (await Parent.findOne({ email })) return res.status(400).json({ error: 'Email already registered.' });

    const parent = await Parent.create({ name, email, password });
    res.status(201).json({ token: signParentToken(parent._id), name: parent.name,
                           settings: { dailyLimitMinutes: parent.settings.dailyLimitMinutes } });
  } catch (err) { handleError(res, err); }
});

// POST /api/parent/login
router.post('/login', async (req, res) => {
  try {
    const email    = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const parent   = await Parent.findOne({ email });
    if (!parent || !(await parent.matchPassword(password)))
      return res.status(401).json({ error: 'Email or password incorrect.' });
    res.json({ token: signParentToken(parent._id), name: parent.name, settings: parent.settings });
  } catch (err) { handleError(res, err); }
});

// PATCH /api/parent/settings — daily play-time limit (5–120 min)
router.patch('/settings', protectParent, async (req, res) => {
  try {
    const mins = Math.round(Number(req.body.dailyLimitMinutes));
    if (!Number.isFinite(mins) || mins < 5 || mins > 120)
      return res.status(400).json({ error: 'Limit must be between 5 and 120 minutes.' });
    req.parent.settings.dailyLimitMinutes = mins;
    await req.parent.save();
    // the child's game reads this shared value via GET /api/settings
    await Setting.findOneAndUpdate({ key: 'dailyLimitMinutes' }, { value: mins }, { upsert: true });
    res.json({ settings: req.parent.settings });
  } catch (err) { handleError(res, err); }
});

// GET /api/parent/children — every child account with progress (passwords never included)
router.get('/children', protectParent, async (req, res) => {
  try {
    const children = await User.find({}).select('name age avatar scores totalScore createdAt').sort({ createdAt: 1 }).lean();
    res.json(children);
  } catch (err) { handleError(res, err); }
});

module.exports = router;
