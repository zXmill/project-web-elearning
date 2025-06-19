'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // define association here
      Review.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      Review.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course',
      });
    }
  }
  Review.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      }
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id',
      }
    },
    reviewText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Review',
    // Timestamps are true by default, so createdAt and updatedAt will be added.
    // If you used defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') in migration,
    // Sequelize will manage these fields automatically.
  });
  return Review;
};
