const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderBoardController');
const { isLoggedIn } = require('../middleware/authMiddleware');

router.get('/', isLoggedIn, getLeaderboard);
router.get('/:gameId', isLoggedIn, getLeaderboard);

module.exports = router;
