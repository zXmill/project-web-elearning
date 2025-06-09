const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://e-learning-testing-web.netlify.app/.netlify/functions/auth/google/callback'
}, async (_,__, profile, done) => {
  try {
    if (!profile.emails?.[0]?.value) {
      throw new Error('No email provided from Google');
    }

    const [user] = await User.findOrCreate({
      where: { googleId: profile.id },
      defaults: {
        email: profile.emails[0].value,
        namaLengkap: profile.displayName,
        role: 'user'
      }
    });

    // Fetch full user to ensure we have all fields
    const fullUser = await User.findByPk(user.id);
    done(null, fullUser);
  } catch (error) {
    console.error('Passport Google Strategy Error:', error);
    done(error, null);
  }
}));

passport.serializeUser((user, done)=> done(null, user.id));
passport.deserializeUser((id, done)=> User.findByPk(id).then(u=>done(null,u)));

module.exports = passport;