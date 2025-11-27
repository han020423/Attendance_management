// models/user.js
const Sequelize = require('sequelize');

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      role: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'STUDENT' },
      name: { type: Sequelize.STRING(255), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'User',
      tableName: 'users',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.User.hasMany(db.Course, { foreignKey: 'instructor_id', sourceKey: 'id' });
    db.User.hasMany(db.Enrollment, { foreignKey: 'user_id', sourceKey: 'id' });
    db.User.hasMany(db.Attendance, { foreignKey: 'student_id', sourceKey: 'id' });
    db.User.hasMany(db.Attendance, { foreignKey: 'updated_by', sourceKey: 'id', as: 'UpdatedAttendances' });
    db.User.hasMany(db.ExcuseRequest, { foreignKey: 'student_id', sourceKey: 'id' });
    db.User.hasMany(db.ExcuseRequest, { foreignKey: 'reviewed_by', sourceKey: 'id', as: 'ReviewedExcuses' });
    db.User.hasMany(db.AttendanceAppeal, { foreignKey: 'student_id', sourceKey: 'id' });
    db.User.hasMany(db.AttendanceAppeal, { foreignKey: 'reviewed_by', sourceKey: 'id', as: 'ReviewedAppeals' });
    db.User.hasMany(db.Message, { foreignKey: 'from_user_id', sourceKey: 'id', as: 'SentMessages' });
    db.User.hasMany(db.Message, { foreignKey: 'to_user_id', sourceKey: 'id', as: 'ReceivedMessages' });
    db.User.hasMany(db.VoteResponse, { foreignKey: 'student_id', sourceKey: 'id' });
    db.User.hasMany(db.Notification, { foreignKey: 'user_id', sourceKey: 'id' });
    db.User.hasMany(db.AuditLog, { foreignKey: 'actor_id', sourceKey: 'id' });
  }
}

module.exports = User;
