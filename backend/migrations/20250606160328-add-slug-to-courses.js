'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Column 'slug' with unique constraint is already added by 20240502000000-create-courses.js
    // This migration's up action is now redundant.
    console.log('ℹ️ Column slug with unique constraint already exists or handled by create-courses migration. Skipping addColumn and addIndex.');
    return Promise.resolve();
  },

  async down (queryInterface, Sequelize) {
    // Remove the unique index first
    await queryInterface.removeIndex('Courses', 'unique_slug_on_courses');
    // Then remove the column
    await queryInterface.removeColumn('Courses', 'slug');
  }
};
