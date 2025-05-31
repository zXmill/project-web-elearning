const passport = require('passport');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/profile-pictures');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + '-' + Date.now() + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

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
