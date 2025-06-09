const { Sequelize } = require('sequelize');
const path = require('path');
// When running in Netlify, .env files are not typically used for production.
// Environment variables should be set in the Netlify UI.
// For local development with Netlify Dev, you can use a .env file at the root or set them in netlify.toml.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
}

// Define the selective logger function (can be simplified or removed for serverless if verbose logging is not desired)
const selectiveLogger = (sqlQuery, sequelizeQueryOptions) => {
  const allowedContexts = [
    'userRegister',
    'userEnrollment',
    'userProfileChange',
    'adminChange',
  ];
  if (sequelizeQueryOptions && sequelizeQueryOptions.loggingContext && allowedContexts.includes(sequelizeQueryOptions.loggingContext)) {
    console.log(`[SEQUELIZE_LOG][${sequelizeQueryOptions.loggingContext}] ${sqlQuery}`);
  }
};

let sequelizeInstance;

// For Netlify functions, we will always use the PostgreSQL configuration.
// The DATABASE_URL must be set in Netlify's environment variables.
if (!process.env.DATABASE_URL) {
  // For local development (e.g. `netlify dev`), if DATABASE_URL is not set,
  // you might want to fall back to a local Postgres instance or throw a more specific error.
  // However, for deployed functions, this variable is critical.
  console.warn('DATABASE_URL environment variable is not set. Sequelize will not be able to connect.');
  // throw new Error('DATABASE_URL environment variable is not set.');
}

sequelizeInstance = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  // Logging can be set to false to reduce noise in serverless function logs,
  // or use a more sophisticated logging strategy.
  logging: process.env.NODE_ENV === 'development' ? selectiveLogger : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // This is often needed for services like Neon, Heroku Postgres. Review your DB provider's SSL requirements.
    },
  },
  pool: { // Optional: configure connection pooling for serverless environments
    max: 5, // Adjust based on expected concurrency and DB limits
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelizeInstance;
