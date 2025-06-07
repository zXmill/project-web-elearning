// models/question.js
module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    moduleId:  { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'Modules', // Name of the Modules table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // If a module (test) is deleted, its questions are also deleted
    },
    teksSoal:  { type: DataTypes.TEXT, allowNull: false },
    type:      { type: DataTypes.ENUM('mcq','upload'), allowNull: false }, // 'upload' might be for other uses, 'mcq' for tests
    options:   { type: DataTypes.JSON },  // array opsi untuk MCQ, e.g., [{id: 'a', text: 'Option 1'}, {id: 'b', text: 'Option 2'}]
    correctOptionId: { type: DataTypes.STRING, allowNull: true }, // Stores the 'id' of the correct option from the options array.
    explanation: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Optional feedback/explanation shown when answer is incorrect'
    }
  }, { // Added options object for hooks
    hooks: {
      beforeCreate: (question, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Question: BeforeCreate hook, context: ${options.loggingContext}, Question ID: ${question.id || 'New Question'}`);
        }
      },
      beforeUpdate: (question, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Question: BeforeUpdate hook, context: ${options.loggingContext}, Question ID: ${question.id}`);
        }
      },
      beforeDestroy: (question, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Question: BeforeDestroy hook, context: ${options.loggingContext}, Question ID: ${question.id}`);
        }
      },
      beforeBulkCreate: (questions, options) => {
        if (options.loggingContext) {
          console.log(`[HOOKS] Question: BeforeBulkCreate hook, context: ${options.loggingContext}, Number of Questions: ${questions.length}`);
        }
      }
      // beforeBulkUpdate and beforeBulkDestroy are not directly supported with loggingContext in the same way.
    }
  });

  Question.associate = (models) => {
    Question.belongsTo(models.Module, {
      foreignKey: 'moduleId',
      as: 'module',
    });
  };

  return Question;
};
