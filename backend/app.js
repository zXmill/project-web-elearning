const express = require('express');
const path = require('path'); // Import path module
const app = express();
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