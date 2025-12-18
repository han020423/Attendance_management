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
    // 수업 세션이 삭제되면, 해당 공결 신청도 삭제됩니다.
    db.ExcuseRequest.belongsTo(db.ClassSession, { foreignKey: 'session_id', targetKey: 'id', onDelete: 'CASCADE' });
    // 학생이 삭제되면, 해당 학생의 공결 신청도 삭제됩니다.
    db.ExcuseRequest.belongsTo(db.User, { as: 'Student', foreignKey: 'student_id', targetKey: 'id', onDelete: 'CASCADE' });
    // 검토한 관리자/교수가 삭제되면, 공결 신청의 '검토자' 필드만 NULL로 설정됩니다.
    db.ExcuseRequest.belongsTo(db.User, { as: 'Reviewer', foreignKey: 'reviewed_by', targetKey: 'id', onDelete: 'SET NULL' });
    db.ExcuseRequest.hasMany(db.ExcuseFile, { foreignKey: 'excuse_id', sourceKey: 'id' });
  }
}

module.exports = ExcuseRequest;
