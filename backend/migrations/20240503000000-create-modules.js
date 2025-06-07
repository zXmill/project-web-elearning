'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Modules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses', // Name of the Courses table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      judul: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ', 'PDF_DOCUMENT'),
        allowNull: false,
      },
      contentText: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      initialContent: { // For PAGE type, stores HTML from Rich Text Editor
        type: Sequelize.TEXT,
        allowNull: true
      },
      pageContent: { // For 'PAGE' type (structured content) or QUIZ type (JSON questions).
        type: Sequelize.JSON,
        allowNull: true
      },
      pdfPath: { // Repurposed: For 'PDF_DOCUMENT' type, stores URL/path to the PDF
        type: Sequelize.STRING,
        allowNull: true
      },
      videoLink: { // Legacy: For 'video' type (can be handled by PAGE type)
        type: Sequelize.STRING,
        allowNull: true
      },
      order: { // For sequencing modules
        type: Sequelize.INTEGER,
        allowNull: false
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
    await queryInterface.dropTable('Modules');
  }
};
