const express = require('express');
const router  = express.Router();
const { getGames, loadSave, writeSave } = require('../controllers/gameController');
const { isLoggedIn, isNotBanned } = require('../middleware/authMiddleware');

router.get('/',                  isLoggedIn, isNotBanned, getGames);
router.get('/save/:gameId',      isLoggedIn, isNotBanned, loadSave);
router.post('/save/:gameId',     isLoggedIn, isNotBanned, writeSave);

module.exports = router;
