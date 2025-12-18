// models/vote.js
const Sequelize = require('sequelize');

class Vote extends Sequelize.Model {
  static initiate(sequelize) {
    Vote.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      closes_at: { type: Sequelize.DATE, allowNull: true },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'OPEN' }, // OPEN, CLOSED
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Vote',
      tableName: 'votes',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Vote.belongsTo(db.Course, { foreignKey: 'course_id', targetKey: 'id', onDelete: 'CASCADE' });
    db.Vote.belongsTo(db.ClassSession, { as: 'TargetSession', foreignKey: 'target_session_id', targetKey: 'id', onDelete: 'CASCADE' });
    db.Vote.hasMany(db.VoteOption, { foreignKey: 'vote_id', sourceKey: 'id' });
    db.Vote.hasMany(db.VoteResponse, { foreignKey: 'vote_id', sourceKey: 'id' });
  }
}

module.exports = Vote;
