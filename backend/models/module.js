module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Module', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    judul: DataTypes.STRING,
    type: { type: DataTypes.ENUM('web','pdf'), defaultValue: 'web' },
    contentText: DataTypes.TEXT,
    pdfPath: DataTypes.STRING,
    videoLink: DataTypes.STRING,
    hasQuiz: { type: DataTypes.BOOLEAN, defaultValue: false },
  });
};