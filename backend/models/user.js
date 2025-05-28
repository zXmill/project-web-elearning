module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, unique: true },
    namaLengkap: DataTypes.STRING,
    nim: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    passwordHash: DataTypes.STRING,
    googleId: DataTypes.STRING,
    role: { type: DataTypes.ENUM('user','admin'), defaultValue: 'user' },
  });
};