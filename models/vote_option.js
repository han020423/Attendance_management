// models/vote_option.js
const Sequelize = require('sequelize');

class VoteOption extends Sequelize.Model {
  static initiate(sequelize) {
    VoteOption.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      label: { type: Sequelize.STRING(255), allowNull: false },
    }, {
      sequelize,
      timestamps: false,
      underscored: true,
      modelName: 'VoteOption',
      tableName: 'vote_options',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.VoteOption.belongsTo(db.Vote, { foreignKey: 'vote_id', targetKey: 'id' });
    db.VoteOption.hasMany(db.VoteResponse, { foreignKey: 'option_id', sourceKey: 'id' });
  }
}

module.exports = VoteOption;
