// models/notification.js
const Sequelize = require('sequelize');

class Notification extends Sequelize.Model {
  static initiate(sequelize) {
    Notification.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      type: { type: Sequelize.STRING(50), allowNull: false }, // e.g., 'NEW_NOTICE', 'ATTENDANCE_OPEN', 'EXCUSE_RESULT'
      message: { type: Sequelize.STRING(255), allowNull: false },
      link: { type: Sequelize.STRING(255) },
      is_read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Notification',
      tableName: 'notifications',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Notification.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
  }
}

module.exports = Notification;
