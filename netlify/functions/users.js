const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const passport = require('passport'); // If user routes are protected

// Adjust the path to your actual user routes and configurations
// Assuming 'userRoutes.js' exists in 'backend/routes/'
const userRoutes = require('../../backend/routes/userRoutes');
const sequelize = require('../../backend/config/database'); // To initialize DB connection
// If you have a central passport configuration, require it here
// require('../../backend/middleware/passport')(passport); // Example path

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

// Initialize passport if your user routes use it for protection
app.use(passport.initialize());

// Mount the user routes
app.use('/', userRoutes);

// Optional: Centralized error handling for this function
app.use((err, req, res, next) => {
  console.error('[Function Error: users]', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'An internal server error occurred.' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Test database connection (optional)
sequelize.authenticate()
  .then(() => console.log('Database connected for users function.'))
  .catch(err => console.error('Unable to connect to the database for users function:', err));

module.exports.handler = serverless(app);
