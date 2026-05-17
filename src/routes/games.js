const express = require('express');
const router = express.Router();
const { getGames } = require('../controllers/gameController');
const { isLoggedIn } = require('../middleware/authMiddleware');

// Oyun listesi: sadece giriş yapmış kullanıcılar görebilir
router.get('/', isLoggedIn, getGames);

module.exports = router;