'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Column 'order' is already added by 20240503000000-create-modules.js
    // This migration's up action is now redundant.
    Promise.resolve();
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Modules', 'order');
  }
};
