const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth'); // General authentication
const { isAdmin } = require('../middleware/adminAuth');   // Admin role check
const adminController = require('../controllers/adminController');
const courseAdminController = require('../controllers/courseAdminController'); // Import courseAdminController
const moduleAdminController = require('../controllers/moduleAdminController'); // Import moduleAdminController
const questionAdminController = require('../controllers/questionAdminController'); // Import questionAdminController

// Middleware for file uploads (multer)
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs module for directory creation

// Configure Multer for course image uploads
const courseImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Construct path relative to this file's location (backend/routes/admin.js)
    // Go up one level to 'backend/', then into 'public/uploads/courses/'
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'courses');
    
    // Ensure the directory exists, create it if it doesn't
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const uploadCourseImage = multer({ storage: courseImageStorage });

// Configure Multer for module PDF uploads
const modulePdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'modules');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const uploadModulePdf = multer({ storage: modulePdfStorage });

// Configure Multer for Excel file uploads (for bulk user creation)
const excelFileStorage = multer.diskStorage({
  // For simplicity, store in a temporary location or handle in memory if preferred
  // destination: (req, file, cb) => {
  //   const uploadPath = path.join(__dirname, '..', 'temp', 'uploads'); // Example: temp folder
  //   fs.mkdirSync(uploadPath, { recursive: true });
  //   cb(null, uploadPath);
  // },
  // filename: (req, file, cb) => {
  //   cb(null, `${Date.now()}-${file.originalname}`);
  // }
  // Using memory storage for now, as we'll process it immediately
});
const uploadExcelFile = multer({ 
  storage: multer.memoryStorage(), // Use memoryStorage to handle file buffer directly
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed.'), false);
    }
  }
});


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
  uploadExcelFile.single('userBulkFile'), // 'userBulkFile' will be the field name in FormData
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
  uploadCourseImage.single('imageFile'), // Middleware for image upload
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
  uploadCourseImage.single('imageFile'), // Middleware for image upload
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

// --- Content PDF Upload for Rich Text Editor ---
router.post(
  '/upload-content-pdf',
  authMiddleware,
  isAdmin,
  uploadModulePdf.single('contentPdfFile'), // Use existing PDF uploader, field name 'contentPdfFile'
  adminController.uploadContentPdf         // New controller function
);

// --- Module PDF Upload for PDF_DOCUMENT type ---
router.post(
  '/upload-module-pdf', // New dedicated route
  authMiddleware,
  isAdmin,
  uploadModulePdf.single('modulePdfFile'), // Use existing 'uploadModulePdf' multer instance, field name 'modulePdfFile'
  adminController.uploadModulePdf          // The new controller function we added
);

module.exports = router;
