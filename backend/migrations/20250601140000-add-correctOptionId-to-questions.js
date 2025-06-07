'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Column 'correctOptionId' is already added by 20240504000000-create-questions.js
    // This migration's up action is now redundant.
    console.log('ℹ️ Column correctOptionId already exists or handled by create-questions migration. Skipping addColumn.');
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Questions', 'correctOptionId');
      console.log('✅ Successfully removed correctOptionId column from Questions table');
    } catch (error) {
      console.error('❌ Error removing correctOptionId column:', error);
      throw error;
    }
  }
};
