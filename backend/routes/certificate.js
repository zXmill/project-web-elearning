const router = require('express').Router();
const ctrl = require('../controllers/certificateController');
router.post('/', ctrl.issue);
module.exports = router;