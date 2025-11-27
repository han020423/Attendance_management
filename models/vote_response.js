// models/vote_response.js
const Sequelize = require('sequelize');

class VoteResponse extends Sequelize.Model {
  static initiate(sequelize) {
    VoteResponse.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'VoteResponse',
      tableName: 'vote_responses',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.VoteResponse.belongsTo(db.Vote, { foreignKey: 'vote_id', targetKey: 'id' });
    db.VoteResponse.belongsTo(db.VoteOption, { foreignKey: 'option_id', targetKey: 'id' });
    db.VoteResponse.belongsTo(db.User, { as: 'Student', foreignKey: 'student_id', targetKey: 'id' });
  }
}

module.exports = VoteResponse;
