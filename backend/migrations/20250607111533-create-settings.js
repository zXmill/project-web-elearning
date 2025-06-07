'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      siteTitle: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'TeraPlus'
      },
      contactEmail: {
        type: Sequelize.STRING,
        allowNull: true
      },
      logoUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      maintenanceMode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      allowRegistrations: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      defaultUserRole: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'user'
      },
      enablePrerequisites: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      defaultCertificateTemplate: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'template1'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Settings');
  }
};
