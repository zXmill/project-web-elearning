'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('Users');
    if (!tableDefinition.affiliasi) {
      await queryInterface.addColumn('Users', 'affiliasi', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableDefinition.noHp) {
      await queryInterface.addColumn('Users', 'noHp', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // To make down idempotent as well, though less critical for this error
    const tableDefinition = await queryInterface.describeTable('Users');
    if (tableDefinition.affiliasi) {
      await queryInterface.removeColumn('Users', 'affiliasi');
    }
    if (tableDefinition.noHp) {
      await queryInterface.removeColumn('Users', 'noHp');
    }
  }
};
