'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Add the new pageContent column
      await queryInterface.addColumn('Modules', 'pageContent', {
        type: Sequelize.JSON,
        allowNull: true,
      }, { transaction });

      // Change the ENUM definition for the 'type' column
      // Note: Modifying ENUMs can be tricky and database-dependent.
      // This attempts a direct change. If issues arise (especially with SQLite),
      // more complex migration steps (like table recreation) might be needed.
      await queryInterface.changeColumn('Modules', 'type', {
        type: Sequelize.ENUM('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ'),
        allowNull: false,
      }, { transaction });
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Revert the ENUM definition for the 'type' column
      await queryInterface.changeColumn('Modules', 'type', {
        type: Sequelize.ENUM('text', 'pdf', 'video', 'pre_test', 'post_test'),
        allowNull: false,
      }, { transaction });

      // Remove the pageContent column
      await queryInterface.removeColumn('Modules', 'pageContent', { transaction });
    });
  }
};
