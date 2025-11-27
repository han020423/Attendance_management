// models/department.js
const Sequelize = require('sequelize');

class Department extends Sequelize.Model {
  static initiate(sequelize) {
    Department.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Department',
      tableName: 'departments',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Department.hasMany(db.Course, { foreignKey: 'department_id', sourceKey: 'id' });
  }
}

module.exports = Department;
