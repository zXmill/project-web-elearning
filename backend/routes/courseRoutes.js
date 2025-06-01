const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware: authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Protected routes (require authentication)
router.get('/:courseId/modules', authenticateToken, courseController.getCourseModules);
router.get('/:courseId/pre-test/questions', authenticateToken, courseController.getPreTestQuestionsByCourseId);
router.get('/:courseId/post-test/questions', authenticateToken, courseController.getPostTestQuestionsByCourseId);

router.post('/:courseId/enroll', authenticateToken, courseController.enrollInCourse);
router.get('/:courseId/enrollment-status', authenticateToken, courseController.getEnrollmentStatus);

// This route might be better under /api/users/me/enrolled-courses or similar in userRoutes.js
// For now, keeping it here as it's course-related from a user perspective.
router.get('/user/enrolled', authenticateToken, courseController.getEnrolledCourses); // Changed path for clarity

router.post('/:courseId/modules/:moduleId/complete', authenticateToken, courseController.markModuleComplete);
router.post('/:courseId/modules/:moduleId/record-score', authenticateToken, courseController.recordTestScore);
router.get('/:courseId/progress', authenticateToken, courseController.getUserProgressForCourse);

router.get('/:courseId/certificate/eligibility', authenticateToken, courseController.checkCertificateEligibility);
router.get('/:courseId/certificate/download', authenticateToken, courseController.downloadCertificate);

module.exports = router;
