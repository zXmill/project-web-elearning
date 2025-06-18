const { Sequelize } = require('sequelize');
const config = require('./config.json'); // Load the config file
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env]; // Get the config for the current environment

// Define the selective logger function
const selectiveLogger = (sqlQuery, sequelizeQueryOptions) => {
  // Define the contexts for which logging should occur
  const allowedContexts = [
    'userRegister',
    'userEnrollment',
    'userProfileChange',
    'adminChange',
  ];

  // Check if logging is enabled in the dbConfig for the current environment
  if (dbConfig.logging && sequelizeQueryOptions && sequelizeQueryOptions.loggingContext) {
    if (allowedContexts.includes(sequelizeQueryOptions.loggingContext)) {
      console.log(`[SEQUELIZE_LOG][${sequelizeQueryOptions.loggingContext}] ${sqlQuery}`);
    }
  }
  // If dbConfig.logging is a simple boolean true (and not a function),
  // and you want general SQL logging for development without specific contexts:
  else if (dbConfig.logging === true && env === 'development') {
     // console.log(`[SEQUELIZE_DEV_LOG] ${sqlQuery}`); // Example for general dev logging
  }
};

let sequelize;
if (dbConfig.use_env_variable) {
  // If use_env_variable is set (like for DATABASE_URL in production)
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], {
    dialect: dbConfig.dialect, // Make sure dialect is passed
    dialectOptions: dbConfig.dialectOptions, // Pass dialectOptions
    logging: dbConfig.logging ? selectiveLogger : false,
  });
} else {
  // Otherwise, use the detailed config (like for local development with SQLite)
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    storage: dbConfig.storage, // For SQLite
    dialectOptions: dbConfig.dialectOptions,
    logging: dbConfig.logging ? selectiveLogger : false,
  });
}

module.exports = sequelize;
