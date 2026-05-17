const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const { listUsers, deleteUser, setBan, resetUserGame, resetGameForAll } = require('../controllers/adminController');

router.use(isLoggedIn, isAdmin);

router.get('/users', listUsers);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/ban', setBan);
router.post('/users/:userId/reset-game', resetUserGame);
router.post('/games/reset', resetGameForAll);

module.exports = router;
