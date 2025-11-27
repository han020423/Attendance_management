// controllers/dashboardController.js
const { Op } = require('sequelize');
const { Course, ClassSession, Enrollment, Attendance } = require('../models');

// GET /me/dashboard
exports.getDashboard = async (req, res, next) => {
  const { id, role } = req.session.user;
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    if (role === 'INSTRUCTOR') {
      const courses = await Course.findAll({ where: { instructor_id: id } });
      const courseIds = courses.map(c => c.id);

      const todaySessions = await ClassSession.findAll({
        where: {
          course_id: { [Op.in]: courseIds },
          date: todayString,
        },
        include: [{ model: Course, attributes: ['title'] }],
        order: [['start_at', 'ASC']],
      });

      res.render('dashboard/instructor', {
        title: '교원 대시보드',
        todaySessions,
      });

    } else if (role === 'STUDENT') {
      const enrollments = await Enrollment.findAll({ where: { user_id: id } });
      const courseIds = enrollments.map(e => e.course_id);

      const todaySessions = await ClassSession.findAll({
        where: {
          course_id: { [Op.in]: courseIds },
          date: todayString,
        },
        include: [{ model: Course, attributes: ['title'] }],
        order: [['start_at', 'ASC']],
      });
      
      // 학생의 오늘 출석 기록
      const sessionIds = todaySessions.map(s => s.id);
      const attendances = await Attendance.findAll({
        where: {
          student_id: id,
          session_id: { [Op.in]: sessionIds }
        }
      });

      // 세션에 출석 정보를 합침
      const sessionsWithAttendance = todaySessions.map(session => {
        const attendance = attendances.find(a => a.session_id === session.id);
        return {
          ...session.get({ plain: true }),
          attendance: attendance ? attendance.get({ plain: true }) : null,
        };
      });

      res.render('dashboard/student', {
        title: '학생 대시보드',
        todaySessions: sessionsWithAttendance,
      });
    } else { // ADMIN
      res.render('dashboard/admin', { title: '관리자 대시보드' });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
