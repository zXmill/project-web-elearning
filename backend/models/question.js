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
    correctOptionId: { type: DataTypes.STRING, allowNull: true } // Stores the 'id' of the correct option from the options array.
  });

  Question.associate = (models) => {
    Question.belongsTo(models.Module, {
      foreignKey: 'moduleId',
      as: 'module',
    });
  };

  return Question;
};
