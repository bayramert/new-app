const express = require('express');
const router  = express.Router();
const { getProfile, updateUsername, updatePassword } = require('../controllers/userController');
const { isLoggedIn } = require('../middleware/authMiddleware');

router.get('/profile',  isLoggedIn, getProfile);
router.put('/username', isLoggedIn, updateUsername);
router.put('/password', isLoggedIn, updatePassword);

module.exports = router;
