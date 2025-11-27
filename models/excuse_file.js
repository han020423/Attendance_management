// models/excuse_file.js
const Sequelize = require('sequelize');

class ExcuseFile extends Sequelize.Model {
  static initiate(sequelize) {
    ExcuseFile.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      file_path: { type: Sequelize.STRING(255), allowNull: false },
      original_name: { type: Sequelize.STRING(255), allowNull: false },
      mime_type: { type: Sequelize.STRING(100), allowNull: false },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'ExcuseFile',
      tableName: 'excuse_files',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.ExcuseFile.belongsTo(db.ExcuseRequest, { foreignKey: 'excuse_id', targetKey: 'id' });
  }
}

module.exports = ExcuseFile;
