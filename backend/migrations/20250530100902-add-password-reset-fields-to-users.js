'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Columns 'passwordResetToken' and 'passwordResetExpires' are already added by 20240501000000-create-users.js
    // This migration's up action is now redundant.
    Promise.resolve();
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'passwordResetToken');
    await queryInterface.removeColumn('Users', 'passwordResetExpires');
  }
};
