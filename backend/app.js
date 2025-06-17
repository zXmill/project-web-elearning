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

console.log('Allowed CORS origins on startup:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    console.log('Incoming CORS request origin:', origin);
    if (!origin) { // Allow requests with no origin (like mobile apps, curl, server-to-server)
      console.log('CORS: No origin, allowing.');
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      console.log(`CORS: Origin ${origin} is in allowed list.`);
      return callback(null, true);
    } else {
      console.log(`CORS: Origin ${origin} is NOT in allowed list.`);
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
  },
  credentials: true, // If you need to handle cookies or authorization headers
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", // Explicitly define allowed methods
  allowedHeaders: "Content-Type,Authorization,X-Requested-With,Origin,Accept" // Corrected: Removed Access-Control-Allow-Origin
}));

// Route requires - ensure these paths are correct for your project structure
const adminRoutes = require('./routes/admin');
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/auth'); // Assuming auth.js is the router file
const userRoutes = require('./routes/userRoutes'); // Assuming userRoutes.js exists

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


// ...existing code... (This comment was in your original file)

// Centralized error handling (optional but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
