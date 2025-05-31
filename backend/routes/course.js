const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth'); // For authenticated routes

console.log('🔵 [DEBUG] backend/routes/course.js loaded');

// --- Enrollment Routes (Authenticated) ---
// These are placed before generic /:id or /:courseId routes to ensure they are matched correctly.

// GET /api/courses/enrolled - Get all courses the current user is enrolled in
router.get('/enrolled', auth.authMiddleware, courseController.getEnrolledCourses);

// POST /api/courses/:courseId/enroll - Enroll in a course
router.post('/:courseId/enroll', auth.authMiddleware, courseController.enrollInCourse);

// GET /api/courses/:courseId/enrollment-status - Check enrollment status for a course
router.get('/:courseId/enrollment-status', auth.authMiddleware, courseController.getEnrollmentStatus);
// --- End Enrollment Routes ---


// --- Other Course-Specific & Public Routes ---

// GET /api/courses - Public route to get all courses
router.get('/', courseController.getAllCourses);

// GET /api/courses/test/:testId - A specific test route
router.get('/test/:testId', (req, res) => {
  console.log('🔵 [DEBUG] /test/:testId route hit. testId:', req.params.testId);
  res.status(200).json({ message: 'Test route for courses successful!', testId: req.params.testId });
});

// GET /api/courses/:courseId/pretest-questions
router.get('/:courseId/pretest-questions', courseController.getPreTestQuestionsByCourseId);

// GET /api/courses/:courseId/posttest-questions
router.get('/:courseId/posttest-questions', courseController.getPostTestQuestionsByCourseId);

// GET /api/courses/:courseId/modules - Get all modules for a specific course
router.get('/:courseId/modules', courseController.getCourseModules);

// POST /api/courses/:courseId/modules/:moduleId/complete - Mark a module as complete (Authenticated)
router.post('/:courseId/modules/:moduleId/complete', auth.authMiddleware, courseController.markModuleComplete);

// POST /api/courses/:courseId/modules/:moduleId/record-score - Record a test score (Authenticated)
router.post('/:courseId/modules/:moduleId/record-score', auth.authMiddleware, courseController.recordTestScore);

// GET /api/courses/:courseId/user-progress - Get user progress for a course (Authenticated)
router.get('/:courseId/user-progress', auth.authMiddleware, courseController.getUserProgressForCourse);

// GET /api/courses/:courseId/certificate-eligibility - Check certificate eligibility (Authenticated)
router.get('/:courseId/certificate-eligibility', auth.authMiddleware, courseController.checkCertificateEligibility);

// GET /api/courses/:id - Route for getting a single course by ID
// This MUST be defined after more specific GET routes like '/enrolled' or '/test/:testId'
// to prevent 'enrolled' or 'test' from being interpreted as an :id.
router.get('/:id', (req, res, next) => {
  console.log('🔵 [DEBUG] GET /:id route hit. ID:', req.params.id);
  courseController.getCourseById(req, res, next);
});

module.exports = router;
