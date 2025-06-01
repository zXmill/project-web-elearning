 require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./middleware/passport');
const cors = require('cors');
const path = require('path'); // Added path module
const { sequelize, User } = require('./models'); // Added User model

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
// Serve static files from the 'public/uploads' directory, mapped to the '/uploads' URL path
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
 app.use(session({ secret: process.env.SESSION_SECRET, resave:false, saveUninitialized:false }));
 app.use(passport.initialize());
 app.use(passport.session());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Authorization');
  next();
});
 app.use('/api/auth', require('./routes/auth'));
 app.use('/api/courses', require('./routes/courseRoutes')); // Corrected to use courseRoutes.js
 app.use('/api/certificates', require('./routes/certificate'));
 app.use('/api/admin', require('./routes/admin')); // Mount admin routes

// Global error handler - MUST be defined AFTER all other app.use() and routes calls
app.use((err, req, res, next) => {
  console.error('💥 GLOBAL ERROR HANDLER:', err.stack || err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Terjadi kesalahan internal pada server.',
    // Optionally, include stack in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

 // **Force sync untuk development - changed to false to persist data**
 sequelize.sync({ force: false }) // Changed force to false
   .then(async () => { // Made async to use await for user creation
     console.log('✅ SQLite DB synced'); // Message updated to reflect sync type

    const port = process.env.PORT || 3000; // Note: nodemon seems to be running it on 3001
     app.listen(port, () => console.log(`🚀 Server started on port ${port}`));
   })
   .catch(err => console.error('❌ Sync error:', err));
