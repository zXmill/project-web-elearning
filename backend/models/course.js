module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    judul: { type: DataTypes.STRING, allowNull: false },
    deskripsi: { type: DataTypes.TEXT, allowNull: true },
    slug: { // Added slug field
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    imageSrc: { type: DataTypes.STRING, allowNull: true }, // For course thumbnail
    area: { type: DataTypes.STRING, allowNull: true },     // For filtering by body area
    syaratDanKetentuan: { type: DataTypes.TEXT, allowNull: true },
    needsPreTest: { type: DataTypes.BOOLEAN, defaultValue: true },
    needsPostTest: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
    minimumPostTestScore: { type: DataTypes.INTEGER, defaultValue: 70, allowNull: false },
    prerequisites: { // Array of prerequisite course IDs or objects representing prerequisite courses
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of prerequisite course IDs or objects representing prerequisite courses'
    },
    status: { // Add status field to match DB schema
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'FREE',
    },
    waGroupLink: { // Added WA Group Link
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, { // Added options object for hooks
    hooks: {
      beforeCreate: (course, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Course: BeforeCreate hook, context: ${options.loggingContext}, Course ID: ${course.id || 'New Course'}`);
        }
      },
      beforeUpdate: (course, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Course: BeforeUpdate hook, context: ${options.loggingContext}, Course ID: ${course.id}`);
        }
      },
      beforeDestroy: (course, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Course: BeforeDestroy hook, context: ${options.loggingContext}, Course ID: ${course.id}`);
        }
      },
      beforeBulkCreate: (courses, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Course: BeforeBulkCreate hook, context: ${options.loggingContext}, Number of Courses: ${courses.length}`);
        }
      }
      // beforeBulkUpdate and beforeBulkDestroy are not directly supported with loggingContext in the same way.
    }
  });

  Course.associate = (models) => {
    // Course has many Modules
    Course.hasMany(models.Module, {
      foreignKey: 'courseId',
      as: 'modules',
      onDelete: 'CASCADE',
    });

    // Course can have many Users enrolled, through Enrollment
    Course.belongsToMany(models.User, {
      through: models.Enrollment,
      foreignKey: 'courseId',
      otherKey: 'userId',
      as: 'enrolledUsers',
    });

    // Course has many direct enrollment records
    Course.hasMany(models.Enrollment, {
      foreignKey: 'courseId',
      as: 'enrollments',
    });

    // Course has many user progress records
    Course.hasMany(models.UserProgress, {
      foreignKey: 'courseId',
      as: 'userProgress',
    });

    // Course can have many Reviews
    Course.hasMany(models.Review, {
      foreignKey: 'courseId',
      as: 'reviews',
    });
  };

  return Course;
};
