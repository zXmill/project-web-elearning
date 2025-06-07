'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // pageContent column is already added by 20240503000000-create-modules.js
      console.log('ℹ️ Column pageContent already exists or handled by create-modules migration. Skipping addColumn.');

      // Change the ENUM definition for the 'type' column
      // This migration changes the ENUM to ('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ')
      // from the original ('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ', 'PDF_DOCUMENT')
      // Another migration (20250606181138-modify-module-type-enum-for-pdf.js) will likely adjust this further.
      console.log("ℹ️ Changing 'type' column ENUM to ('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ')");
      await queryInterface.changeColumn('Modules', 'type', {
        type: Sequelize.ENUM('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ'),
        allowNull: false,
      }, { transaction });
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Revert the ENUM definition for the 'type' column to include 'PDF_DOCUMENT' as per create-modules.js
      // or a more comprehensive set if this down is meant to revert multiple steps.
      // For now, aligning with the state before this specific 'up' ran.
      // The original create-modules.js had: ENUM('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ', 'PDF_DOCUMENT')
      console.log("ℹ️ Reverting 'type' column ENUM to ('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ', 'PDF_DOCUMENT')");
      await queryInterface.changeColumn('Modules', 'type', {
        type: Sequelize.ENUM('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ', 'PDF_DOCUMENT'), // Reverted to include PDF_DOCUMENT
        allowNull: false,
      }, { transaction });

      // pageContent column is part of the create-modules.js migration, so its removal
      // should ideally be handled by the down method of create-modules.js (dropTable).
      // However, if this migration's 'up' had successfully added it (if it weren't a duplicate),
      // then removing it here in 'down' would be correct. Since 'up' is now skipping it,
      // this removeColumn is technically not reverting this specific migration's 'up' action.
      // For safety and to match the original intent if 'up' *had* added it, we can leave it,
      // or comment it out if we strictly want 'down' to only revert what 'up' did.
      // console.log('ℹ️ pageContent column removal is handled by create-modules.js down method (dropTable). Skipping removeColumn here.');
    });
  }
};
