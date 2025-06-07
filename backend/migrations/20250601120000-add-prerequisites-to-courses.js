'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Column 'prerequisites' is already added by 20240502000000-create-courses.js
    // This migration's up action is now redundant.
    console.log('ℹ️ Column prerequisites already exists or handled by create-courses migration. Skipping addColumn.');
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Courses', 'prerequisites');
      console.log('✅ Successfully removed prerequisites column from Courses table');
    } catch (error) {
      console.error('❌ Error removing prerequisites column:', error);
      throw error;
    }
  }
};
