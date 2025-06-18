console.log('Starting backend/app.js...'); // At the very top

const express = require('express');
const path = require('path');
// const cors = require('cors'); // CORS package commented out
const app = express();
console.log('Express app initialized.');

// CORS Configuration - REMOVED
// const allowedOrigins = [ ... ];
// console.log('Allowed CORS origins on startup:', allowedOrigins);
// app.use(cors({ ... })); // CORS middleware REMOVED

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
