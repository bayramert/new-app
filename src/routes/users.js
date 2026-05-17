const express = require('express');
const router  = express.Router();
const { getProfile, updateUsername, updatePassword } = require('../controllers/userController');
const { isLoggedIn, isNotBanned } = require('../middleware/authMiddleware');

router.get('/profile',  isLoggedIn, isNotBanned, getProfile);
router.put('/username', isLoggedIn, isNotBanned, updateUsername);
router.put('/password', isLoggedIn, isNotBanned, updatePassword);

module.exports = router;
