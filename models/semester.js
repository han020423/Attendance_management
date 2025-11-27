// models/semester.js
const Sequelize = require('sequelize');

class Semester extends Sequelize.Model {
  static initiate(sequelize) {
    Semester.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      start_date: { type: Sequelize.DATEONLY, allowNull: true },
      end_date: { type: Sequelize.DATEONLY, allowNull: true },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Semester',
      tableName: 'semesters',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Semester.hasMany(db.Course, { foreignKey: 'semester_id', sourceKey: 'id' });
  }
}

module.exports = Semester;
