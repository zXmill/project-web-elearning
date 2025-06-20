const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const enrollmentController = require('../controllers/enrollmentController');
const moduleAdminController = require('../controllers/moduleAdminController');
const { authMiddleware, restrictTo } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');

router.use(authMiddleware);
router.use(isAdmin);

// Dashboard routes
router.get('/dashboard-summary', adminController.getDashboardSummary);
router.get('/activities', adminController.getRecentActivities);

// User management routes
router.get('/users', adminController.getAllUsers);

// Course management routes
router.get('/courses', adminController.getAllCoursesAdmin);
router.get('/courses/:id/modules', moduleAdminController.getModulesByCourse);
router.post('/courses/:id/modules', moduleAdminController.createModule);
router.put('/courses/:id/modules/:moduleId', moduleAdminController.updateModule);
router.delete('/courses/:id/modules/:moduleId', moduleAdminController.deleteModule);

// Enrollment management routes
router.get('/enrollments/approval', adminController.getEnrollmentsForApproval);
router.post('/enrollments/:id/approve-practical-test', adminController.updateEnrollmentPracticalTestDetails);
router.post('/enrollments/:id/reject-certificate', adminController.rejectEnrollmentCertificate);
router.post('/enrollments/:id/approve-certificate', adminController.approveEnrollmentCertificate);

// Settings routes
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Practical test and review routes
router.post('/enrollments/:id/assign-practical-test', enrollmentController.assignPracticalTest);
router.post('/enrollments/:id/submit-practical-test', enrollmentController.submitPracticalTest);
router.get('/enrollments/:id/download-recordings', enrollmentController.downloadRecordings);
router.post('/courses/:id/reviews', enrollmentController.submitReview);
router.get('/courses/:id/wa-group', enrollmentController.getWaGroupLink);

module.exports = router;
