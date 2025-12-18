// models/attendance.js
const Sequelize = require('sequelize');

class Attendance extends Sequelize.Model {
  static initiate(sequelize) {
    Attendance.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      status: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }, // 0:미정, 1:출석, 2:지각, 3:결석, 4:공결
      checked_at: { type: Sequelize.DATE },
      method_used: { type: Sequelize.STRING(50) },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Attendance',
      tableName: 'attendances',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Attendance.belongsTo(db.ClassSession, { foreignKey: 'session_id', targetKey: 'id', onDelete: 'CASCADE' });
    db.Attendance.belongsTo(db.User, { as: 'Student', foreignKey: 'student_id', targetKey: 'id', onDelete: 'CASCADE' });
    db.Attendance.belongsTo(db.User, { as: 'Updater', foreignKey: 'updated_by', targetKey: 'id', onDelete: 'SET NULL' });
    db.Attendance.hasOne(db.AttendanceAppeal, { foreignKey: 'attendance_id', sourceKey: 'id' });
  }
}

module.exports = Attendance;
