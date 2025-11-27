// models/audit_log.js
const Sequelize = require('sequelize');

class AuditLog extends Sequelize.Model {
  static initiate(sequelize) {
    AuditLog.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      action: { type: Sequelize.STRING(255), allowNull: false }, // e.g., 'USER_LOGIN', 'ATTENDANCE_UPDATE'
      target_type: { type: Sequelize.STRING(50) }, // e.g., 'Attendance', 'User'
      target_id: { type: Sequelize.INTEGER },
      meta_json: { type: Sequelize.JSON },
    }, {
      sequelize,
      timestamps: true,
      updatedAt: false,
      underscored: true,
      modelName: 'AuditLog',
      tableName: 'audit_logs',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.AuditLog.belongsTo(db.User, { as: 'Actor', foreignKey: 'actor_id', targetKey: 'id' });
  }
}

module.exports = AuditLog;
