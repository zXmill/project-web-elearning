'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Enrollments', {
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
          model: 'Users', // Name of the target model's table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses', // Name of the target model's table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      enrolledAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // Sequelize handles this by default if not specified
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // Sequelize handles this by default if not specified
      }
    });

    // Add a unique constraint for userId and courseId
    await queryInterface.addIndex('Enrollments', ['userId', 'courseId'], {
      unique: true,
      name: 'unique_enrollment_user_course'
    });
  },

  async down(queryInterface, Sequelize) {
    // It's good practice to remove named indexes explicitly in the down migration
    // await queryInterface.removeIndex('Enrollments', 'unique_enrollment_user_course');
    // However, dropTable should also remove indexes associated with the table.
    // For simplicity and common practice, just dropping the table is often sufficient.
    await queryInterface.dropTable('Enrollments');
  }
};
