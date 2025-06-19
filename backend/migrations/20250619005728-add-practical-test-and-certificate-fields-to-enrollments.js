'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Enrollments', 'practicalTestStatus', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Belum Dikumpulkan',
    });
    await queryInterface.addColumn('Enrollments', 'practicalTestFileUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Enrollments', 'practicalTestAdminNotes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Enrollments', 'certificateAdminApprovedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Enrollments', 'certificateRejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Enrollments', 'certificateStatusUpdatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Enrollments', 'practicalTestStatus');
    await queryInterface.removeColumn('Enrollments', 'practicalTestFileUrl');
    await queryInterface.removeColumn('Enrollments', 'practicalTestAdminNotes');
    await queryInterface.removeColumn('Enrollments', 'certificateAdminApprovedAt');
    await queryInterface.removeColumn('Enrollments', 'certificateRejectionReason');
    await queryInterface.removeColumn('Enrollments', 'certificateStatusUpdatedAt');
  }
};
