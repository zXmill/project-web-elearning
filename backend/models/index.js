// models/index.js
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Define models
const User = require('./user')(sequelize, DataTypes);
const Course = require('./course')(sequelize, DataTypes);
const Module = require('./module')(sequelize, DataTypes);
const Question = require('./question')(sequelize, DataTypes);
const Enrollment = require('./enrollment')(sequelize, DataTypes); // Added
const UserProgress = require('./userProgress')(sequelize, DataTypes); // Added
const Setting = require('./setting')(sequelize, DataTypes); // Added Setting model

// Create the db object to pass to associations and for export
const db = {
  sequelize, // Export sequelize instance
  Sequelize: require('sequelize'), // Export Sequelize library itself
  User,
  Course,
  Module,
  Question,
  Enrollment,
  UserProgress,
  Setting // Added Setting model to db object
};

// Call associate methods for each model, if they exist
// This allows models to define their relationships
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Associations are now expected to be defined within each model's static `associate` method.
// The loop above `Object.keys(db).forEach... db[modelName].associate(db)` handles calling them.
// Removed redundant direct association definitions that were here previously to prevent conflicts.

// Export the db object which now includes all models and sequelize instance
module.exports = db;
