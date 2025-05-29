const express = require('express');
const router = express.Router();
const passport = require('passport'); // <-- Tambahkan ini
const authController = require('../controllers/authController');

// Google Auth Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleLogin
);

// Local Auth Routes
router.post('/login', authController.localLogin);

module.exports = router;