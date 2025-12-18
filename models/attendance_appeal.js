// models/attendance_appeal.js
const Sequelize = require('sequelize');

class AttendanceAppeal extends Sequelize.Model {
  static initiate(sequelize) {
    AttendanceAppeal.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'PENDING' }, // PENDING, APPROVED, REJECTED
      message: { type: Sequelize.TEXT, allowNull: false },
      review_comment: { type: Sequelize.TEXT },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'AttendanceAppeal',
      tableName: 'attendance_appeals',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.AttendanceAppeal.belongsTo(db.Attendance, { foreignKey: 'attendance_id', targetKey: 'id', onDelete: 'CASCADE' });
    db.AttendanceAppeal.belongsTo(db.User, { as: 'Student', foreignKey: 'student_id', targetKey: 'id', onDelete: 'CASCADE' });
    db.AttendanceAppeal.belongsTo(db.User, { as: 'Reviewer', foreignKey: 'reviewed_by', targetKey: 'id', onDelete: 'SET NULL' });
  }
}

module.exports = AttendanceAppeal;
