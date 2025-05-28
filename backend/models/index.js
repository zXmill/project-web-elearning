// models/index.js
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User   = require('./user')(sequelize, DataTypes);
const Course = require('./course')(sequelize, DataTypes);
const Module = require('./module')(sequelize, DataTypes);
const Question = require('./question')(sequelize, DataTypes);

// Course ↔ Module
Course.hasMany(Module, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Module.belongsTo(Course, { foreignKey: 'courseId' });

// Module ↔ Question  (semua pakai foreignKey: 'moduleId')
Module.hasMany(Question, { foreignKey: 'moduleId', onDelete: 'CASCADE' });
Question.belongsTo(Module, { foreignKey: 'moduleId' });

module.exports = { sequelize, User, Course, Module, Question };
