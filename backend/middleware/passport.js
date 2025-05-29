const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3001/api/auth/google/callback'
}, async (_,__, profile, done) => {
  const [user] = await User.findOrCreate({
    where: { googleId: profile.id },
    defaults: { email: profile.emails[0].value, namaLengkap: profile.displayName, role: 'user' }
  });
  done(null, user);
}));

passport.serializeUser((user, done)=> done(null, user.id));
passport.deserializeUser((id, done)=> User.findByPk(id).then(u=>done(null,u)));

module.exports = passport;