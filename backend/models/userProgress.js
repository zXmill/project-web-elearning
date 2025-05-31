module.exports = (sequelize, DataTypes) => {
  const UserProgress = sequelize.define('UserProgress', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Name of the Users table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    courseId: { // Denormalized for easier querying of progress per course
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses', // Name of the Courses table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    moduleId: { // The specific module/page within the course
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Modules', // Name of the Modules table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true, // Null if not yet completed
    },
    score: { // For 'pre_test' or 'post_test' type modules
      type: DataTypes.INTEGER, // Or DataTypes.FLOAT if scores can be decimal
      allowNull: true, // Null if not a test or not yet taken/scored
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  UserProgress.associate = (models) => {
    UserProgress.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    UserProgress.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course',
    });
    UserProgress.belongsTo(models.Module, {
      foreignKey: 'moduleId',
      as: 'module',
    });
  };

  return UserProgress;
};
