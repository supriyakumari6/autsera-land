
const express  = require('express');
const { protect } = require('../middleware/auth');
const router   = express.Router();

router.get('/', protect, async (req, res) => {
  const u = req.user;
  res.json({
    name:       u.name,
    age:        u.age,
    avatar:     u.avatar,
    scores:     u.scores,
    totalScore: u.totalScore,
    history:    u.history.slice(-50),
  });
});

module.exports = router;
