/**
 * routes/settings.js — GET /api/settings (public)
 * Lets the child's game read the daily play-time limit a parent has set.
 */
const express = require('express');
const Setting = require('../models/Setting');
const { handleError } = require('../utils/respond');
const router  = express.Router();

router.get('/', async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'dailyLimitMinutes' });
    res.json({ dailyLimitMinutes: s ? s.value : 30 });
  } catch (err) { handleError(res, err); }
});

module.exports = router;
