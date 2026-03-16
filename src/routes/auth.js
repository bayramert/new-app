const express = require('express');
const router = express.Router();
const { register, login, logout, me } = require('../controllers/authController');
const { isLoggedIn } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', isLoggedIn, logout);

// GET /api/auth/me
router.get('/me', me);

module.exports = router;