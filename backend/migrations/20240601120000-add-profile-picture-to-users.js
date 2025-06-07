'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Column 'profilePicture' is already added by 20240501000000-create-users.js
    // This migration's up action is now redundant.
    Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'profilePicture');
  }
};
