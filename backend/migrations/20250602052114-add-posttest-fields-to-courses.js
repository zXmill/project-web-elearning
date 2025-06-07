'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Columns 'needsPostTest' and 'minimumPostTestScore' are already added by 20240502000000-create-courses.js
    // This migration's up action is now redundant.
    console.log('ℹ️ Columns needsPostTest and minimumPostTestScore already exist or handled by create-courses migration. Skipping addColumn.');
    return Promise.resolve();
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Courses', 'minimumPostTestScore');
    await queryInterface.removeColumn('Courses', 'needsPostTest');
  }
};
