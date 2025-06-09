const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const passport = require('passport'); // Assuming passport is used and configured

// Adjust the path to your actual auth routes and configurations
const authRoutes = require('../../backend/routes/auth');
const sequelize = require('../../backend/config/database'); // To initialize DB connection
// If you have a central passport configuration (e.g., backend/middleware/passport.js), require it here
// require('../../backend/middleware/passport')(passport); // Example path

const app = express();

// CORS Configuration for Netlify Functions
// Ensure FRONTEND_URL is set in Netlify environment variables for production
const allowedOrigins = [];
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
} else if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000'); // For local frontend dev
  allowedOrigins.push('http://localhost:8888'); // For Netlify Dev local server
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize passport if you're using it
app.use(passport.initialize());
// If you use passport sessions, you might need session middleware,
// but for token-based auth in serverless, it's often not needed per-function.
// app.use(passport.session());


// Mount the authentication routes
// The base path here should align with how you call it from the frontend
// and how Netlify maps requests to functions.
// For example, if your function is 'auth', requests to '/.netlify/functions/auth/*' will hit this.
// If authRoutes itself defines paths like '/login', then mounting at '/' is fine.
app.use('/', authRoutes);

// Optional: Centralized error handling for this function
app.use((err, req, res, next) => {
  console.error('[Function Error: auth]', err);
  // Avoid sending detailed error stacks to client in production
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'An internal server error occurred.' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Test database connection (optional, can be removed after verification)
sequelize.authenticate()
  .then(() => console.log('Database connected for auth function.'))
  .catch(err => console.error('Unable to connect to the database for auth function:', err));

module.exports.handler = serverless(app);
