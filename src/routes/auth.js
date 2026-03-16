// Express kütüphanesini dahil et
const express = require('express');

// Route yöneticisini oluştur
const router = express.Router();

// authController.js'den 4 fonksiyonu al
const { register, login, logout, me } = require('../controllers/authController');

// authMiddleware.js'den giriş kontrol fonksiyonunu al
const { isLoggedIn } = require('../middleware/authMiddleware');

// /api/auth/register adresine POST isteği gelirse register fonksiyonunu çalıştır
router.post('/register', register);

// /api/auth/login adresine POST isteği gelirse login fonksiyonunu çalıştır
router.post('/login', login);

// /api/auth/logout adresine POST isteği gelirse
// önce isLoggedIn ile giriş yapmış mı kontrol et, yapmışsa logout çalıştır
router.post('/logout', isLoggedIn, logout);

// /api/auth/me adresine GET isteği gelirse me fonksiyonunu çalıştır
router.get('/me', me);

// Bu router'ı dışarıya aktar, server.js kullanacak
module.exports = router;