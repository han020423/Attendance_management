// models/message.js
const Sequelize = require('sequelize');

class Message extends Sequelize.Model {
  static initiate(sequelize) {
    Message.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      is_read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Message',
      tableName: 'messages',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Message.belongsTo(db.User, { as: 'FromUser', foreignKey: 'from_user_id', targetKey: 'id', onDelete: 'CASCADE' });
    db.Message.belongsTo(db.User, { as: 'ToUser', foreignKey: 'to_user_id', targetKey: 'id', onDelete: 'CASCADE' });
    db.Message.belongsTo(db.Course, { foreignKey: 'course_id', targetKey: 'id', onDelete: 'CASCADE' }); // course_id가 NULL이면 개인 메시지
  }
}

module.exports = Message;
