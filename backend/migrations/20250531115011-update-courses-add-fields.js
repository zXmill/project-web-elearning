'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // This migration is now empty.
    // The columns 'syaratDanKetentuan' and 'needsPreTest'
    // were found to already exist in the Courses table in your database.
    // The 'status' column was removed based on your feedback.
    // Therefore, no schema changes are applied by this specific migration file.
    return Promise.resolve();
  },

  async down(queryInterface, Sequelize) {
    // Correspondingly, the down migration also does nothing.
    return Promise.resolve();
  }
};
