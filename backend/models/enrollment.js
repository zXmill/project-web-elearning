module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define('Enrollment', {
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
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses', // Name of the Courses table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    enrolledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    practicalTestStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Belum Dikumpulkan', // Indonesian for 'Not Submitted'
    },
    practicalTestFileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    practicalTestAdminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    certificateAdminApprovedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    certificateRejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    certificateStatusUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['userId', 'courseId'],
      },
    ],
    hooks: {
      beforeCreate: (enrollment, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Enrollment: BeforeCreate hook, context: ${options.loggingContext}, Enrollment ID: ${enrollment.id || 'New Enrollment'}, UserID: ${enrollment.userId}, CourseID: ${enrollment.courseId}`);
        }
      },
      beforeUpdate: (enrollment, options) => {
        // Enrollments are typically not updated, but hook is included for completeness
        if (options.loggingContext) {
          console.log(`[HOOKS] Enrollment: BeforeUpdate hook, context: ${options.loggingContext}, Enrollment ID: ${enrollment.id}`);
        }
      },
      beforeDestroy: (enrollment, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Enrollment: BeforeDestroy hook, context: ${options.loggingContext}, Enrollment ID: ${enrollment.id}`);
        }
      },
      beforeBulkCreate: (enrollments, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Enrollment: BeforeBulkCreate hook, context: ${options.loggingContext}, Number of Enrollments: ${enrollments.length}`);
        }
      }
      // beforeBulkUpdate and beforeBulkDestroy are not directly supported with loggingContext in the same way.
    }
  });

  Enrollment.associate = (models) => {
    Enrollment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Enrollment.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course',
    });
  };

  return Enrollment;
};
