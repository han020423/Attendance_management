// models/class_session.js
const Sequelize = require('sequelize');

class ClassSession extends Sequelize.Model {
  static initiate(sequelize) {
    ClassSession.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      week: { type: Sequelize.INTEGER, allowNull: false },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      start_at: { type: Sequelize.TIME, allowNull: false },
      end_at: { type: Sequelize.TIME, allowNull: false },
      room: { type: Sequelize.STRING(255) },
      attendance_method: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'ELECTRONIC' },
      is_holiday: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      is_makeup: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'SCHEDULED' },
      pin_code: { type: Sequelize.STRING(10) },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'ClassSession',
      tableName: 'class_sessions',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    // 과목이 삭제되면, 해당 과목의 모든 수업 세션도 함께 삭제됩니다.
    db.ClassSession.belongsTo(db.Course, { foreignKey: 'course_id', targetKey: 'id', onDelete: 'CASCADE' });
    db.ClassSession.hasMany(db.Attendance, { foreignKey: 'session_id', sourceKey: 'id' });
    db.ClassSession.hasMany(db.ExcuseRequest, { foreignKey: 'session_id', sourceKey: 'id' });
  }
}

module.exports = ClassSession;
