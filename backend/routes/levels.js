
const express = require('express');
const router  = express.Router();

const LEVELS = [
  { id: 'easy',   label: 'Easy',   emoji: '🌱', questions: 6,  timer: null, scorePerQ: 10 },
  { id: 'medium', label: 'Medium', emoji: '🌟', questions: 10, timer: 30,   scorePerQ: 15 },
  { id: 'hard',   label: 'Hard',   emoji: '🔥', questions: 14, timer: 20,   scorePerQ: 20 },
];

router.get('/', (req, res) => res.json(LEVELS));

module.exports = router;
