// models/course_policy.js
const Sequelize = require('sequelize');

class CoursePolicy extends Sequelize.Model {
  static initiate(sequelize) {
    CoursePolicy.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      late_penalty_points: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.5,
        comment: '지각 1회당 감점',
      },
      absence_penalty_points: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 1,
        comment: '결석 1회당 감점',
      },
      lates_for_absence: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
        comment: '결석으로 처리될 지각 횟수',
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'CoursePolicy',
      tableName: 'course_policies',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.CoursePolicy.belongsTo(db.Course, { foreignKey: { name: 'course_id', unique: true }, targetKey: 'id' });
  }
}

module.exports = CoursePolicy;
