'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Name of the Users table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // If user is deleted, their reviews are also deleted
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses', // Name of the Courses table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // If course is deleted, its reviews are also deleted
      },
      reviewText: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      rating: { // Optional rating
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Reviews');
  }
};
