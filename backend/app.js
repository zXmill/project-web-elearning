const express = require('express');
const path = require('path'); // Import path module
const cors = require('cors'); // Import CORS package
const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000', // For local development
  'https://main.d11uqjcf0yrvya.amplifyapp.com', // Your Amplify frontend
  'https://api.qpwoeirutysport.my.id' // Your custom backend domain
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // If you need to handle cookies or authorization headers
}));
const adminRoutes = require('./routes/admin'); // Corrected path to adminRoutes
const courseRoutes = require('./routes/courseRoutes'); // Assuming you have course routes for users
const authRoutes = require('./routes/authRoutes'); // Assuming you have auth routes
const userRoutes = require('./routes/userRoutes'); // Assuming general user routes

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