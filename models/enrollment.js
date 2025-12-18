// models/enrollment.js
const Sequelize = require('sequelize');

class Enrollment extends Sequelize.Model {
  static initiate(sequelize) {
    Enrollment.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      role: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'STUDENT' },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Enrollment',
      tableName: 'enrollments',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Enrollment.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id', onDelete: 'CASCADE' });
    db.Enrollment.belongsTo(db.Course, { foreignKey: 'course_id', targetKey: 'id', onDelete: 'CASCADE' });
  }
}

module.exports = Enrollment;
