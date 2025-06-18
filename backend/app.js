console.log('Starting backend/app.js...'); // At the very top

const express = require('express');
const path = require('path');
const cors = require('cors'); // Uncommented and added CORS package
const app = express();
console.log('Express app initialized.');

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000', // For local frontend development
  'https://main.d350srbff0febm.amplifyapp.com', // Your deployed frontend
  process.env.FRONTEND_URL // Environment variable for frontend URL
];

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));
console.log('CORS middleware enabled. Allowed origins (static part):', allowedOrigins.filter(o => o !== process.env.FRONTEND_URL));
if (process.env.FRONTEND_URL) {
  console.log('FRONTEND_URL from env for CORS:', process.env.FRONTEND_URL);
}


// Route requires - ensure these paths are correct for your project structure
const adminRoutes = require('./routes/admin');
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
console.log('Route modules required.');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('JSON and URLencoded middleware enabled.');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
console.log('Static files middleware for "public" directory enabled.');

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint /api/health hit.'); // Inside the route
  res.status(200).json({ status: 'OK', message: 'Health check successful' });
});

// Mount routes
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
console.log('API routes mounted.');

// Centralized error handling (optional but good practice)
app.use((err, req, res, next) => {
  console.error('Centralized error handler caught an error:', err.stack);
  res.status(err.status || 500).send(err.message || 'Something broke!');
});

const PORT = process.env.PORT || 5000;
console.log(`Attempting to listen on port: ${PORT}`);
app.listen(PORT, () => {
  console.log(`Server successfully listening on port ${PORT}`);
});

console.log('End of backend/app.js execution sequence reached (before async events).');
