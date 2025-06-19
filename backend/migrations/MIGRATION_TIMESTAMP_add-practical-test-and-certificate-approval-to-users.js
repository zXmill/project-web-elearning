'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'practicalTestAssigned', {
      type: Sequelize.ENUM('Paha', 'Betis', 'Pinggang punggung', 'Lengan', 'Not Assigned'),
      allowNull: true, // Allow null initially, will be set after post-test
      defaultValue: 'Not Assigned',
    });
    await queryInterface.addColumn('Users', 'practicalTestStatus', {
      type: Sequelize.ENUM('Not Assigned', 'Assigned', 'Submitted for Review', 'Approved', 'Rejected'),
      allowNull: false,
      defaultValue: 'Not Assigned',
    });
    await queryInterface.addColumn('Users', 'certificateAdminApprovedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'certificateAdminApproverId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users', // Self-reference to Users table for admin ID
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Or 'NO ACTION' depending on desired behavior
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'practicalTestAssigned');
    await queryInterface.removeColumn('Users', 'practicalTestStatus');
    await queryInterface.removeColumn('Users', 'certificateAdminApprovedAt');
    await queryInterface.removeColumn('Users', 'certificateAdminApproverId');
    // If using ENUMs directly in migration without custom types, removing columns is enough.
    // If custom ENUM types were created (e.g., CREATE TYPE ... AS ENUM), they'd need to be dropped.
    // For Sequelize's built-in ENUM inaddColumn, this should suffice.
  }
};
