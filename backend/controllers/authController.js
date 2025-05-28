const passport = require('passport');

exports.googleAuth = passport.authenticate('google',{ scope:['profile','email'] });
exports.googleCallback = passport.authenticate('google',{ failureRedirect:'/login', session:true }),
  (req,res)=> res.redirect('/');