const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const enrollmentController = require('../controllers/enrollmentController');
const { authMiddleware, restrictTo } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');

router.use(authMiddleware);
router.use(isAdmin);

router.get('/enrollments-for-approval', adminController.getEnrollmentsForApproval);
router.post('/enrollments/:id/approve-practical-test', adminController.approveEnrollmentPracticalTestDetails);
router.post('/enrollments/:id/reject-certificate', adminController.rejectEnrollmentCertificate);
router.post('/enrollments/:id/approve-certificate', adminController.approveEnrollmentCertificate);
router.get('/recent-activities', adminController.getRecentActivities);

// New routes for practical test and reviews
router.post('/enrollments/:id/assign-practical-test', enrollmentController.assignPracticalTest);
router.post('/enrollments/:id/submit-practical-test', enrollmentController.submitPracticalTest);
router.get('/enrollments/:id/download-recordings', enrollmentController.downloadRecordings);
router.post('/courses/:id/reviews', enrollmentController.submitReview);
router.get('/courses/:id/wa-group', enrollmentController.getWaGroupLink);

module.exports = router;
