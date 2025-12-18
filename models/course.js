// models/course.js
const Sequelize = require('sequelize');

class Course extends Sequelize.Model {
  static initiate(sequelize) {
    Course.init({
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      code: { type: Sequelize.STRING(50), allowNull: false },
      section: { type: Sequelize.STRING(10), allowNull: false },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Course',
      tableName: 'courses',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Course.belongsTo(db.User, { as: 'Instructor', foreignKey: 'instructor_id', targetKey: 'id', onDelete: 'SET NULL' });
    db.Course.belongsTo(db.Semester, { foreignKey: 'semester_id', targetKey: 'id', onDelete: 'SET NULL' });
    db.Course.belongsTo(db.Department, { foreignKey: 'department_id', targetKey: 'id', onDelete: 'SET NULL' });
    db.Course.hasMany(db.Enrollment, { foreignKey: 'course_id', sourceKey: 'id' });
    db.Course.hasMany(db.ClassSession, { foreignKey: 'course_id', sourceKey: 'id' });
    db.Course.hasMany(db.Message, { foreignKey: 'course_id', sourceKey: 'id' });
    db.Course.hasMany(db.Vote, { foreignKey: 'course_id', sourceKey: 'id' });
    db.Course.hasOne(db.CoursePolicy, { foreignKey: 'course_id', sourceKey: 'id' });
  }
}

module.exports = Course;
