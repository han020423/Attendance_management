// models/excuse_request.js
const Sequelize = require('sequelize');

class ExcuseRequest extends Sequelize.Model {
  static initiate(sequelize) {
    ExcuseRequest.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'PENDING' }, // PENDING, APPROVED, REJECTED
      reason_text: { type: Sequelize.TEXT },
      reason_code: { type: Sequelize.STRING(50) },
      review_comment: { type: Sequelize.TEXT },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'ExcuseRequest',
      tableName: 'excuse_requests',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.ExcuseRequest.belongsTo(db.ClassSession, { foreignKey: 'session_id', targetKey: 'id' });
    db.ExcuseRequest.belongsTo(db.User, { as: 'Student', foreignKey: 'student_id', targetKey: 'id' });
    db.ExcuseRequest.belongsTo(db.User, { as: 'Reviewer', foreignKey: 'reviewed_by', targetKey: 'id' });
    db.ExcuseRequest.hasMany(db.ExcuseFile, { foreignKey: 'excuse_id', sourceKey: 'id' });
  }
}

module.exports = ExcuseRequest;
