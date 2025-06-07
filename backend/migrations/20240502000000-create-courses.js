'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      judul: {
        type: Sequelize.STRING,
        allowNull: false
      },
      deskripsi: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: true, // Assuming slug can be generated later or might not exist for all
        unique: true
      },
      imageSrc: {
        type: Sequelize.STRING,
        allowNull: true
      },
      area: {
        type: Sequelize.STRING,
        allowNull: true
      },
      syaratDanKetentuan: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      needsPreTest: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false // Assuming this should have a default and not be null
      },
      needsPostTest: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      minimumPostTestScore: {
        type: Sequelize.INTEGER,
        defaultValue: 70,
        allowNull: false
      },
      prerequisites: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING, // Consider ENUM if there's a fixed set of statuses
        allowNull: false,
        defaultValue: 'FREE'
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
    await queryInterface.dropTable('Courses');
  }
};
