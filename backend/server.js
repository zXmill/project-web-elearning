 require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./middleware/passport');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
 app.use(session({ secret: process.env.SESSION_SECRET, resave:false, saveUninitialized:false }));
 app.use(passport.initialize());
 app.use(passport.session());

 app.use('/api/auth', require('./routes/auth'));
 app.use('/api/courses', require('./routes/course'));
 app.use('/api/certificates', require('./routes/certificate'));

 // **Force sync untuk development**
 sequelize.sync({ force: true })
   .then(() => {
     console.log('✅ SQLite DB created');
    const port = process.env.PORT || 3000;
     app.listen(port, () => console.log(`🚀 Server started on port ${port}`));
   })
   .catch(err => console.error('❌ Sync error:', err));
