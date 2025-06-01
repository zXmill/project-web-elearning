'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Courses', 'prerequisites', {
        type: Sequelize.JSON,
        allowNull: true,
        after: 'needsPreTest' // Add after existing column
      });
      console.log('✅ Successfully added prerequisites column to Courses table');
    } catch (error) {
      console.error('❌ Error adding prerequisites column:', error);
      throw error;
    }
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
