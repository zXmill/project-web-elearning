const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const enrollmentController = require('../controllers/enrollmentController');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

router.use(authMiddleware);
router.use(adminAuthMiddleware);

router.get('/enrollments-for-approval', adminController.getEnrollmentsForApproval);
router.post('/enrollments/:id/approve-practical-test', adminController.approvePracticalTest);
router.post('/enrollments/:id/reject-certificate', adminController.rejectCertificate);
router.post('/enrollments/:id/approve-certificate', adminController.approveCertificate);
router.get('/recent-activities', adminController.getRecentActivities);

// New routes for practical test and reviews
router.post('/enrollments/:id/assign-practical-test', enrollmentController.assignPracticalTest);
router.post('/enrollments/:id/submit-practical-test', enrollmentController.submitPracticalTest);
router.get('/enrollments/:id/download-recordings', enrollmentController.downloadRecordings);
router.post('/courses/:id/reviews', enrollmentController.submitReview);
router.get('/courses/:id/wa-group', enrollmentController.getWaGroupLink);

module.exports = router;
