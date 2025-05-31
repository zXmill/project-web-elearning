'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // Method untuk compare password
    async validPassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }

  User.init({
    namaLengkap: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      set(value) {
        const salt = bcrypt.genSaltSync(10);
        this.setDataValue('password', bcrypt.hashSync(value, salt));
      }
    },
    googleId: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  User.associate = (models) => {
    // User can be enrolled in many courses through Enrollment
    User.belongsToMany(models.Course, {
      through: models.Enrollment, // Specify the join model
      foreignKey: 'userId',
      otherKey: 'courseId',
      as: 'enrolledCourses',
    });
    // User has many direct enrollment records
    User.hasMany(models.Enrollment, {
      foreignKey: 'userId',
      as: 'enrollments',
    });
    // User has many progress records
    User.hasMany(models.UserProgress, {
      foreignKey: 'userId',
      as: 'progressRecords',
    });
  };

  return User;
};
