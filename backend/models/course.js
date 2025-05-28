module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Course', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    judul: DataTypes.STRING,
    deskripsi: DataTypes.TEXT,
    needsPreTest: { type: DataTypes.BOOLEAN, defaultValue: false },
  });
};