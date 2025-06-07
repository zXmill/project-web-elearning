'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add the column without the unique constraint first
    await queryInterface.addColumn('Courses', 'slug', {
      type: Sequelize.STRING,
      allowNull: true, 
    });
    // Then, add a unique index. This is how SQLite enforces UNIQUE constraints
    // for columns added to existing tables, especially if they allow NULLs.
    // We'll name the index to make it easy to remove in the down migration.
    await queryInterface.addIndex('Courses', ['slug'], {
      unique: true,
      name: 'unique_slug_on_courses', // Optional: specify a name for the index
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the unique index first
    await queryInterface.removeIndex('Courses', 'unique_slug_on_courses');
    // Then remove the column
    await queryInterface.removeColumn('Courses', 'slug');
  }
};
