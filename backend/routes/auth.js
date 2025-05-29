const router = require('express').Router();
const ctrl = require('../controllers/authController');
const passport = require('passport');

router.get('/google', ctrl.googleAuth);
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

module.exports = router;