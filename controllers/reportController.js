// controllers/reportController.js
const { Attendance, Course, ClassSession, User, sequelize, Enrollment } = require('../models');
const { Op } = require('sequelize');

// GET /reports/attendance - 출석 통계 리포트
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { course_id, week } = req.query;
    const instructor_id = req.session.user.id;

    // 교수가 가르치는 과목 목록
    const courses = await Course.findAll({ where: { instructor_id } });

    if (!course_id) {
      // course_id가 없으면 폼만 렌더링
      return res.render('reports/attendance', {
        title: '출석 리포트',
        courses,
        reportData: null,
      });
    }

    const where = { course_id };
    if (week) {
      where.week = week;
    }

    const sessions = await ClassSession.findAll({ where });
    const sessionIds = sessions.map(s => s.id);

    const attendances = await Attendance.findAll({
      where: { session_id: { [Op.in]: sessionIds } },
      include: [{ model: User, as: 'Student', attributes: ['name'] }]
    });

    // 데이터 가공
    const reportData = {
      totalStudents: (await User.count({
        include: [{
          model: Enrollment,
          where: { course_id }
        }]
      })),
      totalSessions: sessions.length,
      summary: {
        present: attendances.filter(a => a.status === 1).length,
        late: attendances.filter(a => a.status === 2).length,
        absent: attendances.filter(a => a.status === 3).length,
        approved_absence: attendances.filter(a => a.status === 4).length,
      },
      // 학생별 결석 횟수
      absenteeism: await Attendance.findAll({
        attributes: [
          'student_id',
          [sequelize.fn('COUNT', sequelize.col('Attendance.id')), 'absent_count']
        ],
        where: {
          session_id: { [Op.in]: sessionIds },
          status: 3 // 결석
        },
        include: [{ model: User, as: 'Student', attributes: ['name'] }],
        group: ['student_id'],
        order: [[sequelize.literal('absent_count'), 'DESC']]
      })
    };

    res.render('reports/attendance', {
      title: '출석 리포트',
      courses,
      selectedCourseId: course_id,
      reportData,
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};
