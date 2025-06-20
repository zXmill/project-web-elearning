'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Enrollments', 'assignedPracticalTest', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isIn: [['Paha', 'Betis', 'Pinggang punggung', 'Lengan']]
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Enrollments', 'assignedPracticalTest');
  }
};
