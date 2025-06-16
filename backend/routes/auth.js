const passport = require('passport');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { upload } = require('../utils/s3Service'); // Import S3 upload middleware

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleLogin
);

// Local Auth
router.post('/login', authController.localLogin);
router.post('/register', authController.registerUser); // New route for registration

// Protected Route for User Profile
router.get(
  '/profile', // Changed from /me
  authController.protect, // This is authMiddleware
  authController.getUserProfile // Changed from getCurrentUser
);

// Protected Route to Update User Profile
router.put(
  '/profile',
  authController.protect, // This is authMiddleware
  authController.updateUserProfile
);

// New route for profile picture upload
router.post(
  '/profile/picture',
  authController.protect,
  upload.single('profilePicture'),
  authController.uploadProfilePicture
);

// Password Reset Routes
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
