'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Setting.init({
    siteTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'TeraPlus'
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    maintenanceMode: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    allowRegistrations: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    defaultUserRole: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user' // Changed from 'student' as per earlier discussion
    },
    enablePrerequisites: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    defaultCertificateTemplate: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'template1'
    }
  }, {
    sequelize,
    modelName: 'Setting',
  });
  return Setting;
};
