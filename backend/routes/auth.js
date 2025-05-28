const router = require('express').Router();
const ctrl = require('../controllers/authController');
router.get('/google', ctrl.googleAuth);
router.get('/google/callback', ctrl.googleCallback);
module.exports = router;