module.exports = (sequelize, DataTypes) => {
  const Module = sequelize.define('Module', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
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
    judul: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ'),
      allowNull: false,
    },
    contentText: { type: DataTypes.TEXT, allowNull: true }, // For instructions (e.g., for QUIZ types) or simple text content
    pageContent: { type: DataTypes.JSON, allowNull: true }, // For 'PAGE' type, stores structured content (e.g., blocks for text, video, PDF)
    pdfPath: { type: DataTypes.STRING, allowNull: true },    // Legacy: For 'pdf' type, will be superseded by pageContent for PAGE type
    videoLink: { type: DataTypes.STRING, allowNull: true },  // Legacy: For 'video' type, will be superseded by pageContent for PAGE type
    order: { type: DataTypes.INTEGER, allowNull: false },   // For sequencing modules
  });

  Module.associate = (models) => {
    Module.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course',
    });
    // Questions will be associated with Modules of type 'pre_test' or 'post_test'
    Module.hasMany(models.Question, {
      foreignKey: 'moduleId', 
      as: 'questions',
    });
    // Module has many user progress records
    Module.hasMany(models.UserProgress, {
      foreignKey: 'moduleId',
      as: 'userProgress',
    });
  };

  return Module;
};
