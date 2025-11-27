// controllers/sessionController.js
const { ClassSession, Attendance, Enrollment, Notification, User, Course, AuditLog } = require('../models');
const { Op } = require('sequelize');

// POST /sessions/:id/open - 출석 시작
exports.openAttendance = async (req, res, next) => {
  try {
    const session = await ClassSession.findByPk(req.params.id, { include: [Course] });
    if (!session) {
      return res.status(404).send('수업을 찾을 수 없습니다.');
    }

    // PIN 생성 (필요 시)
    const pin = Math.random().toString().slice(2, 8);
    session.status = 'OPEN';
    session.pin_code = pin;
    await session.save();

    // 수강생들에게 알림 생성
    const enrollments = await Enrollment.findAll({ where: { course_id: session.course_id } });
    const notifications = enrollments.map(e => ({
      user_id: e.user_id,
      type: 'ATTENDANCE_OPEN',
      message: `[${session.Course.title}] ${session.week}주차 출석이 시작되었습니다.`,
      link: `/courses/${session.course_id}`
    }));
    await Notification.bulkCreate(notifications);

    // 출석 레코드 생성 (기본값: 결석)
    const attendances = enrollments.map(e => ({
        session_id: session.id,
        student_id: e.user_id,
        status: 3, // 3: 결석
    }));
    await Attendance.bulkCreate(attendances, { ignoreDuplicates: true });


    res.redirect('/me/dashboard');
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /sessions/:id/close - 출석 마감
exports.closeAttendance = async (req, res, next) => {
  try {
    const session = await ClassSession.findByPk(req.params.id);
    if (!session) {
      return res.status(404).send('수업을 찾을 수 없습니다.');
    }
    session.status = 'CLOSED';
    session.pin_code = null; // PIN 초기화
    await session.save();
    res.redirect('/me/dashboard');
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /sessions/:id/attend - 학생 출석 처리
exports.handleAttendance = async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;
    const { id: studentId } = req.session.user;
    const { method, pin } = req.body;

    const session = await ClassSession.findByPk(sessionId);
    if (!session || session.status !== 'OPEN') {
      return res.status(400).send('출석 가능한 상태가 아닙니다.');
    }

    let isSuccess = false;
    if (method === 'PIN') {
      if (session.pin_code === pin) {
        isSuccess = true;
      }
    } else { // 'ELECTRONIC'
      isSuccess = true;
    }

    if (isSuccess) {
      const attendance = await Attendance.findOne({ where: { session_id: sessionId, student_id: studentId } });
      if (attendance) {
        // 지각 처리: 수업 시작 시간 + 10분 이후면 지각
        const startTime = new Date(`${session.date} ${session.start_at}`);
        const gracePeriod = 10 * 60 * 1000; // 10분
        const now = new Date();

        attendance.status = (now > new Date(startTime.getTime() + gracePeriod)) ? 2 : 1; // 1: 출석, 2: 지각
        attendance.checked_at = now;
        attendance.method_used = method;
        await attendance.save();
        return res.redirect('/me/dashboard');
      }
    }
    
    // 실패 시
    return res.status(400).send('출석 처리에 실패했습니다. 인증번호를 확인하세요.');

  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /sessions/:id/attendance/summary - 출석 현황 요약
exports.getAttendanceSummary = async (req, res, next) => {
    try {
        const { id: sessionId } = req.params;
        const session = await ClassSession.findByPk(sessionId, { include: [Course] });
        const attendances = await Attendance.findAll({
            where: { session_id: sessionId },
            include: [{ model: User, as: 'Student', attributes: ['name'] }],
            order: [['Student', 'name', 'ASC']]
        });

        const summary = {
            present: attendances.filter(a => a.status === 1).length,
            late: attendances.filter(a => a.status === 2).length,
            absent: attendances.filter(a => a.status === 3).length,
            approved_absence: attendances.filter(a => a.status === 4).length,
        };

        res.render('sessions/summary', {
            title: `${session.Course.title} ${session.week}주차 출석 현황`,
            session,
            attendances,
            summary,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// POST /sessions/:sessionId/attendance/:attendanceId/update - 출석 상태 수동 변경
exports.updateAttendanceStatus = async (req, res, next) => {
  try {
    const { sessionId, attendanceId } = req.params;
    const { status: newStatus, reason } = req.body;
    const instructorId = req.session.user.id;

    const attendance = await Attendance.findByPk(attendanceId);

    if (!attendance) {
      return res.status(404).send('출석 기록을 찾을 수 없습니다.');
    }

    const oldStatus = attendance.status;
    attendance.status = parseInt(newStatus, 10);
    await attendance.save();

    // 감사 로그 기록
    await AuditLog.create({
      user_id: instructorId,
      action: 'UPDATE_ATTENDANCE_STATUS',
      target_type: 'Attendance',
      target_id: attendanceId,
      meta_json: JSON.stringify({ oldStatus, newStatus, reason, sessionId }),
    });

    res.redirect(`/sessions/${sessionId}/attendance/summary`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
