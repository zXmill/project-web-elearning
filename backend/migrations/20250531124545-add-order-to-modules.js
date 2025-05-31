'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Modules', 'order', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0 // Added default value for existing rows
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Modules', 'order');
  }
};
