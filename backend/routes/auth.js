const passport = require('passport');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
// const fs = require('fs'); // No longer needed for Cloudinary storage

// Require Cloudinary and its storage engine for Multer
const cloudinary = require('cloudinary').v2; // Already configured in authController.js
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Ensure Cloudinary is configured (it's done in authController, but good to be aware)
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('Cloudinary environment variables might not be fully set in routes/auth.js context. Ensure they are loaded for multer-storage-cloudinary if it re-reads them.');
}

// Multer setup for Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // The configured Cloudinary instance
  params: async (req, file) => {
    // Determine the folder and filename for Cloudinary
    // You can customize this as needed
    let folder = 'profile-pictures';
    if (process.env.NODE_ENV === 'development') {
      folder = `dev/${folder}`;
    } else if (process.env.NODE_ENV === 'staging') { // Example for staging
      folder = `staging/${folder}`;
    }
    
    const fileExtension = path.extname(file.originalname).substring(1);
    const publicId = `user-${req.user.id}-${Date.now()}`;

    return {
      folder: folder,
      public_id: publicId,
      format: fileExtension, // Or let Cloudinary auto-detect
      // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional: server-side transformations
    };
  },
});

const upload = multer({
  storage: storage, // Use Cloudinary storage
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit (Cloudinary might have its own limits too)
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
