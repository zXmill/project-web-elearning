'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Questions', 'correctOptionId', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'options'
      });
      console.log('✅ Successfully added correctOptionId column to Questions table');
    } catch (error) {
      console.error('❌ Error adding correctOptionId column:', error);
      throw error;
    }
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
