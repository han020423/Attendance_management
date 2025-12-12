// controllers/adminReportController.js
const { Course, ClassSession, Enrollment, User, Attendance, ExcuseRequest, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getCourseMetrics = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const courses = await Course.findAll({
      include: [{ model: User, as: 'Instructor', attributes: ['name'] }],
      order: [['title', 'ASC']]
    });

    let metrics = {};
    if (courseId) {
      const selectedCourse = await Course.findByPk(courseId);
      const enrollments = await Enrollment.findAll({ where: { course_id: courseId }, include: [User] });
      const totalEnrolled = enrollments.length;

      const sessions = await ClassSession.findAll({
        where: { course_id: courseId },
        include: [Attendance],
        order: [['week', 'ASC']],
      });

      // 1. 주차별 지표 계산
      const weeklyMetrics = sessions.map(session => {
        const present = session.Attendances.filter(a => a.status === 1).length;
        const late = session.Attendances.filter(a => a.status === 2).length;
        const approved = session.Attendances.filter(a => a.status === 4).length;
        const absent = totalEnrolled - present - late - approved;
        const attendanceRate = totalEnrolled > 0 ? ((present + late) / totalEnrolled) * 100 : 0;
        return {
          week: session.week,
          date: session.date,
          present,
          late,
          approved,
          absent,
          attendanceRate: attendanceRate.toFixed(2),
        };
      });

      // 2. 전체 출석률 계산
      const totalAttended = weeklyMetrics.reduce((sum, week) => sum + week.present + week.late, 0);
      const totalPossible = totalEnrolled * sessions.length;
      const overallAttendanceRate = totalPossible > 0 ? (totalAttended / totalPossible) * 100 : 0;

      // 3. 공결 승인율 계산
      const excuseRequests = await ExcuseRequest.findAll({
        where: { session_id: { [Op.in]: sessions.map(s => s.id) } }
      });
      const approvedExcuses = excuseRequests.filter(e => e.status === 'APPROVED').length;
      const excuseApprovalRate = excuseRequests.length > 0 ? (approvedExcuses / excuseRequests.length) * 100 : 0;

      // 4. 위험군 학생 계산 (누적 결석/지각)
      const studentStats = {};
      enrollments.forEach(e => {
        studentStats[e.user_id] = { name: e.User.name, late: 0, absent: 0 };
      });

      sessions.forEach(session => {
        session.Attendances.forEach(att => {
          if (studentStats[att.student_id]) {
            if (att.status === 2) studentStats[att.student_id].late++;
            if (att.status === 3) studentStats[att.student_id].absent++;
          }
        });
      });

      const sortedAbsentees = Object.values(studentStats).filter(s => s.absent > 0).sort((a, b) => b.absent - a.absent).slice(0, 5);
      const sortedLates = Object.values(studentStats).filter(s => s.late > 0).sort((a, b) => b.late - a.late).slice(0, 5);

      metrics = {
        courseName: selectedCourse.title,
        totalEnrolled,
        weekly: weeklyMetrics,
        overallAttendanceRate: overallAttendanceRate.toFixed(2),
        excuseApprovalRate: excuseApprovalRate.toFixed(2),
        totalExcuses: excuseRequests.length,
        topAbsentees: sortedAbsentees,
        topLates: sortedLates,
      };
    }

    res.render('admin/reports/course_metrics', {
      title: '과목별 통계 리포트',
      courses,
      metrics,
      selectedCourseId: courseId || null,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
