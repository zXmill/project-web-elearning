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
  }, { // Added options object for hooks
    hooks: {
      beforeCreate: (userProgress, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] UserProgress: BeforeCreate hook, context: ${options.loggingContext}, UserProgress ID: ${userProgress.id || 'New UserProgress'}, UserID: ${userProgress.userId}, CourseID: ${userProgress.courseId}, ModuleID: ${userProgress.moduleId}`);
        }
      },
      beforeUpdate: (userProgress, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] UserProgress: BeforeUpdate hook, context: ${options.loggingContext}, UserProgress ID: ${userProgress.id}`);
        }
      },
      beforeDestroy: (userProgress, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] UserProgress: BeforeDestroy hook, context: ${options.loggingContext}, UserProgress ID: ${userProgress.id}`);
        }
      },
      beforeBulkCreate: (userProgresses, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] UserProgress: BeforeBulkCreate hook, context: ${options.loggingContext}, Number of UserProgresses: ${userProgresses.length}`);
        }
      }
      // beforeBulkUpdate and beforeBulkDestroy are not directly supported with loggingContext in the same way.
    }
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
