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
      type: DataTypes.ENUM('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ', 'PDF_DOCUMENT'), // Added PDF_DOCUMENT
      allowNull: false,
    },
    contentText: { type: DataTypes.TEXT, allowNull: true }, // For instructions (e.g., for QUIZ types) or simple text content
    initialContent: { type: DataTypes.TEXT, allowNull: true }, // For PAGE type, stores HTML from Rich Text Editor
    pageContent: { type: DataTypes.JSON, allowNull: true }, // For 'PAGE' type (structured content) or QUIZ type (JSON questions).
    pdfPath: { type: DataTypes.STRING, allowNull: true },    // Repurposed: For 'PDF_DOCUMENT' type, stores URL/path to the PDF
    videoLink: { type: DataTypes.STRING, allowNull: true },  // Legacy: For 'video' type (can be handled by PAGE type)
    order: { type: DataTypes.INTEGER, allowNull: false },   // For sequencing modules
  }, { // Added options object for hooks
    hooks: {
      beforeCreate: (module, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Module: BeforeCreate hook, context: ${options.loggingContext}, Module ID: ${module.id || 'New Module'}`);
        }
      },
      beforeUpdate: (module, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Module: BeforeUpdate hook, context: ${options.loggingContext}, Module ID: ${module.id}`);
        }
      },
      beforeDestroy: (module, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Module: BeforeDestroy hook, context: ${options.loggingContext}, Module ID: ${module.id}`);
        }
      },
      beforeBulkCreate: (modules, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Module: BeforeBulkCreate hook, context: ${options.loggingContext}, Number of Modules: ${modules.length}`);
        }
      }
      // beforeBulkUpdate and beforeBulkDestroy are not directly supported with loggingContext in the same way.
    }
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
