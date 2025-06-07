const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware: authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:identifier', courseController.getCourseBySlugOrId); // Changed :id to :identifier and controller

// Protected routes (require authentication)

// Routes for fetching pre-test and post-test questions by course identifier (slug or ID)
// These match the frontend's API calls like /courses/:identifier/modules/pretest
router.get('/:identifier/modules/pretest', authenticateToken, courseController.getPreTestQuestionsByIdentifier);
router.get('/:identifier/modules/posttest', authenticateToken, courseController.getPostTestQuestionsByIdentifier);

// Original routes for pre-test/post-test questions (can be kept for compatibility or removed if new ones are preferred)
router.get('/:identifier/pre-test/questions', authenticateToken, courseController.getPreTestQuestionsByIdentifier); 
router.get('/:identifier/post-test/questions', authenticateToken, courseController.getPostTestQuestionsByIdentifier);

// Route for fetching all content modules for a course (expects numeric courseId in controller, but route could be :identifier too if controller is adapted)
router.get('/:courseId/modules', authenticateToken, courseController.getCourseModules); 

router.post('/:courseId/enroll', authenticateToken, courseController.enrollInCourse);
router.get('/:courseId/enrollment-status', authenticateToken, courseController.getEnrollmentStatus);

// This route might be better under /api/users/me/enrolled-courses or similar in userRoutes.js
// For now, keeping it here as it's course-related from a user perspective.
router.get('/user/enrolled', authenticateToken, courseController.getEnrolledCourses); // Changed path for clarity

router.post('/:courseId/modules/:moduleId/complete', authenticateToken, courseController.markModuleComplete); // Keep courseId here as moduleId is specific
router.post('/:courseId/modules/:moduleId/record-score', authenticateToken, courseController.recordTestScore); // Keep courseId here
router.get('/:identifier/progress', authenticateToken, courseController.getUserProgressForCourse); // Changed courseId to identifier

router.get('/:identifier/certificate/eligibility', authenticateToken, courseController.checkCertificateEligibility); // Changed courseId to identifier
router.get('/:identifier/certificate/download', authenticateToken, courseController.downloadCertificate); // Changed courseId to identifier

module.exports = router;
