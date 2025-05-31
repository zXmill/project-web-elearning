const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth'); // General authentication
const { isAdmin } = require('../middleware/adminAuth');   // Admin role check
const adminController = require('../controllers/adminController');

// All routes in this file will first be protected by authMiddleware, then by isAdmin

// Example Admin Route: Get Dashboard Summary
router.get(
  '/dashboard-summary',
  authMiddleware, // Ensure user is logged in
  isAdmin,        // Ensure user is an admin
  adminController.getDashboardSummary
);

// Example Admin Route: Get All Users
router.get(
  '/users',
  authMiddleware,
  isAdmin,
  adminController.getAllUsers
);

// Route to create a new user (admin can create other users, including admins)
router.post(
  '/users',
  authMiddleware,
  isAdmin,
  adminController.createUser // We'll create this controller function
);

// Add more admin-specific routes here for CRUD operations on users, courses, content etc.
router.put(
  '/users/:id',
  authMiddleware,
  isAdmin,
  adminController.updateUser
);
router.delete(
  '/users/:id',
  authMiddleware,
  isAdmin,
  adminController.deleteUser
);

module.exports = router;
