const express = require('express');
const router  = express.Router();
const { getGames, loadSave, writeSave } = require('../controllers/gameController');
const { isLoggedIn } = require('../middleware/authMiddleware');

router.get('/',                  isLoggedIn, getGames);
router.get('/save/:gameId',      isLoggedIn, loadSave);
router.post('/save/:gameId',     isLoggedIn, writeSave);

module.exports = router;