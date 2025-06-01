module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    judul: { type: DataTypes.STRING, allowNull: false },
    deskripsi: { type: DataTypes.TEXT, allowNull: true },
    imageSrc: { type: DataTypes.STRING, allowNull: true }, // For course thumbnail
    area: { type: DataTypes.STRING, allowNull: true },     // For filtering by body area
    syaratDanKetentuan: { type: DataTypes.TEXT, allowNull: true },
    needsPreTest: { type: DataTypes.BOOLEAN, defaultValue: true },
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
  };

  return Course;
};
