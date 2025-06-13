const express = require('express');
const path = require('path'); // Import path module
const cors = require('cors'); // Import cors
const app = express();
const adminRoutes = require('./routes/admin'); // Corrected path to adminRoutes
const courseRoutes = require('./routes/courseRoutes'); // Assuming you have course routes for users
const authRoutes = require('./routes/auth'); // Assuming you have auth routes
const userRoutes = require('./routes/admin'); // Assuming general user routes


// CORS Configuration
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = []; // Initialize empty array

if (isProduction) {
  // Replace with your actual Netlify frontend URL in production
  // You can also get this from an environment variable like process.env.FRONTEND_URL
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  } else {
    console.warn('FRONTEND_URL environment variable is not set for production CORS. Please set it.');
    // Add a sensible default or throw an error if critical
  }
} else {
  // For local development, allow your local frontend
  allowedOrigins.push('http://localhost:3000'); // Assuming frontend runs on 3000
  // Add other local origins if needed, e.g., for different frontend ports
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // If you need to handle cookies or authorization headers
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/api/admin', adminRoutes); // Prefix admin routes with /api
app.use('/api/courses', courseRoutes); // Prefix course routes with /api
app.use('/api/auth', authRoutes); // Prefix auth routes with /api
app.use('/api/users', userRoutes); // Prefix user routes with /api


// ...existing code...

// Centralized error handling (optional but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
