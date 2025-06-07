'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Column 'explanation' is already added by 20240504000000-create-questions.js
    // This migration's up action is now redundant.
    console.log('ℹ️ Column explanation already exists or handled by create-questions migration. Skipping addColumn.');
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Questions', 'explanation');
      console.log('✅ Successfully removed explanation column from Questions table');
    } catch (error) {
      console.error('❌ Error removing explanation column:', error);
      throw error;
    }
  }
};
