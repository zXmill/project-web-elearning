// models/question.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Question', {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    moduleId:  { type: DataTypes.INTEGER, allowNull: false },    // ini kita gunakan sebagai FK
    teksSoal:  { type: DataTypes.TEXT, allowNull: false },
    type:      { type: DataTypes.ENUM('mcq','upload'), allowNull: false },
    options:   { type: DataTypes.JSON }  // array opsi untuk MCQ
  });
};
