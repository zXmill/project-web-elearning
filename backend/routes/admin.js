const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth'); // General authentication
const { isAdmin } = require('../middleware/adminAuth');   // Admin role check
const adminController = require('../controllers/adminController');
const courseAdminController = require('../controllers/courseAdminController'); // Import courseAdminController
const moduleAdminController = require('../controllers/moduleAdminController'); // Import moduleAdminController
const questionAdminController = require('../controllers/questionAdminController'); // Import questionAdminController
const { upload } = require('../utils/s3Service'); // Import S3 upload middleware


// All routes in this file will first be protected by authMiddleware, then by isAdmin

// Example Admin Route: Get Dashboard Summary
router.get(
  '/dashboard-summary',
  authMiddleware, // Ensure user is logged in
  isAdmin,        // Ensure user is an admin
  adminController.getDashboardSummary
);

// --- Recent Activities Route ---
router.get(
  '/activities',
  authMiddleware,
  isAdmin,
  adminController.getRecentActivities
);

// --- Site Settings Routes ---
router.get(
  '/settings',
  authMiddleware,
  isAdmin,
  adminController.getSettings
);

router.put(
  '/settings',
  authMiddleware,
  isAdmin,
  adminController.updateSettings
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
  adminController.createUser
);

// Route for bulk user creation
router.post(
  '/users/bulk-create', // Changed route to match frontend
  authMiddleware,
  isAdmin,
  upload.single('userBulkFile'), // Use S3 upload middleware
  adminController.bulkCreateUsers 
);

// --- COURSE CRUD (ADMIN) ---
// GET /api/admin/courses - List all courses (admin view)
router.get(
  '/courses',
  authMiddleware,
  isAdmin,
  courseAdminController.getAllCourses // Use courseAdminController
);

// POST /api/admin/courses - Create a new course
router.post(
  '/courses',
  authMiddleware,
  isAdmin,
  upload.single('imageFile'), // Use S3 upload middleware
  courseAdminController.createCourse    // Use courseAdminController
);

// GET /api/admin/courses/:id - Get a single course by ID (admin view)
router.get(
  '/courses/:id',
  authMiddleware,
  isAdmin,
  courseAdminController.getCourse // Use courseAdminController
);

// PUT /api/admin/courses/:id - Update a course
router.put(
  '/courses/:id',
  authMiddleware,
  isAdmin,
  upload.single('imageFile'), // Use S3 upload middleware
  courseAdminController.updateCourse    // Use courseAdminController
);

// DELETE /api/admin/courses/:id - Delete a course
router.delete(
  '/courses/:id',
  authMiddleware,
  isAdmin,
  courseAdminController.deleteCourse // Use courseAdminController
);

// --- MODULE CRUD (ADMIN) ---
// GET /api/admin/courses/:courseId/modules - List all modules for a course
router.get(
  '/courses/:courseId/modules',
  authMiddleware,
  isAdmin,
  moduleAdminController.getModulesByCourse
);

// POST /api/admin/courses/:courseId/modules - Create a new module for a course
router.post(
  '/courses/:courseId/modules',
  authMiddleware,
  isAdmin,
  // uploadModulePdf.single('pdfFile'), // Removed: PDF URL now sent in body as pdfPath
  moduleAdminController.createModule
);

// GET /api/admin/modules/:moduleId - Get a single module by ID
router.get(
  '/modules/:moduleId',
  authMiddleware,
  isAdmin,
  moduleAdminController.getModuleById
);

// PUT /api/admin/modules/:moduleId - Update a module
router.put(
  '/modules/:moduleId',
  authMiddleware,
  isAdmin,
  // uploadModulePdf.single('pdfFile'), // Removed: PDF URL now sent in body as pdfPath
  moduleAdminController.updateModule
);

// DELETE /api/admin/modules/:moduleId - Delete a module
router.delete(
  '/modules/:moduleId',
  authMiddleware,
  isAdmin,
  moduleAdminController.deleteModule
);

// POST /api/admin/courses/:courseId/modules/reorder - Reorder modules for a course
router.post(
  '/courses/:courseId/modules/reorder',
  authMiddleware,
  isAdmin,
  moduleAdminController.reorderModules
);

// --- QUESTION CRUD (ADMIN) ---
// GET /api/admin/modules/:moduleId/questions - List all questions for a module
router.get(
  '/modules/:moduleId/questions',
  authMiddleware,
  isAdmin,
  questionAdminController.getQuestions // Corrected function name
);

// POST /api/admin/modules/:moduleId/questions - Create a new question for a module
router.post(
  '/modules/:moduleId/questions',
  authMiddleware,
  isAdmin,
  questionAdminController.createQuestion
);

// GET /api/admin/questions/:questionId - Get a single question by ID
router.get(
  '/questions/:questionId',
  authMiddleware,
  isAdmin,
  questionAdminController.getQuestionById
);

// PUT /api/admin/questions/:questionId - Update a question
router.put(
  '/questions/:questionId',
  authMiddleware,
  isAdmin,
  questionAdminController.updateQuestion
);

// DELETE /api/admin/questions/:questionId - Delete a question
router.delete(
  '/questions/:questionId',
  authMiddleware,
  isAdmin,
  questionAdminController.deleteQuestion
);

// --- User Management by Admin ---
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

// Route to update user's practical test status and notes
router.put(
  '/users/:userId/practical-test',
  authMiddleware,
  isAdmin,
  adminController.updateUserPracticalTest
);

// Route to approve a user's certificate
router.put(
  '/users/:userId/approve-certificate',
  authMiddleware,
  isAdmin,
  adminController.approveUserCertificate
);

// --- Content PDF Upload for Rich Text Editor ---
router.post(
  '/upload-content-pdf',
  authMiddleware,
  isAdmin,
  upload.single('contentPdfFile'), // Use S3 upload middleware
  adminController.uploadContentPdf         // New controller function
);

// --- Module PDF Upload for PDF_DOCUMENT type ---
router.post(
  '/upload-module-pdf', // New dedicated route
  authMiddleware,
  isAdmin,
  upload.single('modulePdfFile'), // Use S3 upload middleware
  adminController.uploadModulePdf          // The new controller function we added
);

// --- Enrollment & Certificate Approval Routes ---
// GET /api/admin/enrollments/approval - Get all enrollments for approval view
router.get(
  '/enrollments/approval',
  authMiddleware,
  isAdmin,
  adminController.getEnrollmentsForApproval
);

// PUT /api/admin/enrollments/:enrollmentId/practical-test - Update practical test details for an enrollment
router.put(
  '/enrollments/:enrollmentId/practical-test',
  authMiddleware,
  isAdmin,
  adminController.updateEnrollmentPracticalTestDetails
);

// PUT /api/admin/enrollments/:enrollmentId/approve-certificate - Approve certificate for an enrollment
router.put(
  '/enrollments/:enrollmentId/approve-certificate',
  authMiddleware,
  isAdmin,
  adminController.approveEnrollmentCertificate
);

// PUT /api/admin/enrollments/:enrollmentId/reject-certificate - Reject certificate for an enrollment
router.put(
  '/enrollments/:enrollmentId/reject-certificate',
  authMiddleware,
  isAdmin,
  adminController.rejectEnrollmentCertificate
);

module.exports = router;
