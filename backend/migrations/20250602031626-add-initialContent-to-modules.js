'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Column 'initialContent' is already added by 20240503000000-create-modules.js
    // This migration's up action is now redundant.
    // The original migration used a transaction, so we'll keep the structure for consistency if needed later,
    // but the core action is replaced by Promise.resolve().
    await queryInterface.sequelize.transaction(async (transaction) => {
      return Promise.resolve();
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('Modules', 'initialContent', { transaction });
    });
  }
};
