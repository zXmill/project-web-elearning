'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Courses', 'needsPostTest', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn('Courses', 'minimumPostTestScore', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 70, // Default minimum score, e.g., 70%
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Courses', 'minimumPostTestScore');
    await queryInterface.removeColumn('Courses', 'needsPostTest');
  }
};
