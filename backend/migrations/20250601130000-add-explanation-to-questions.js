'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Questions', 'explanation', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'correctOptionId' // Add after existing column
      });
      console.log('✅ Successfully added explanation column to Questions table');
    } catch (error) {
      console.error('❌ Error adding explanation column:', error);
      throw error;
    }
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
