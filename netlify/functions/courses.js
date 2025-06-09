const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const passport = require('passport'); // If course routes are protected
const path = require('path');

// Adjust the path to your actual course routes and configurations
const courseRoutes = require(path.resolve(__dirname, '..', '..', 'backend', 'routes', 'courseRoutes')); // Main course routes
// If you have another course file like 'course.js' for different functionalities,
// you might need to merge them or create a separate function if they are truly distinct.
// const otherCourseRoutes = require(path.resolve(__dirname, '..', '..', 'backend', 'routes', 'course'));
const sequelize = require(path.resolve(__dirname, '..', '..', 'backend', 'config', 'database')); // To initialize DB connection
// If you have a central passport configuration, require it here
// const passportConfig = require(path.resolve(__dirname, '..', '..', 'backend', 'middleware', 'passport'));
// if (passportConfig) passportConfig(passport);

const app = express();

// CORS Configuration for Netlify Functions
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

// Initialize passport if your course routes use it for protection
app.use(passport.initialize());

// Mount the course routes
app.use('/', courseRoutes);
// if (otherCourseRoutes) {
//   app.use('/', otherCourseRoutes); // Mount additional course routes if necessary
// }

// Optional: Centralized error handling for this function
app.use((err, req, res, next) => {
  console.error('[Function Error: courses]', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'An internal server error occurred.' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Test database connection (optional)
sequelize.authenticate()
  .then(() => console.log('Database connected for courses function.'))
  .catch(err => console.error('Unable to connect to the database for courses function:', err));

module.exports.handler = serverless(app);
