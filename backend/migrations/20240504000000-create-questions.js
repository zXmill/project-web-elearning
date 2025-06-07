'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      moduleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Modules', // Name of the table, should match what's in create-modules.js
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      teksSoal: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('mcq', 'upload'),
        allowNull: false
      },
      options: { // For MCQ questions
        type: Sequelize.JSON,
        allowNull: true // Allow null if type is not 'mcq' or if options are not immediately available
      },
      correctOptionId: { // For MCQ questions
        type: Sequelize.STRING, // Assuming option IDs are strings like 'a', 'b', 'c'
        allowNull: true // Allow null if type is not 'mcq' or if not applicable
      },
      explanation: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Questions');
  }
};
