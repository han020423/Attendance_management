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
        // 교수가 출석을 마감하기 전까지는 모두 '출석'으로 처리
        const now = new Date();

        attendance.status = 1; // 1: 출석
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
        if (!session) {
            return res.status(404).send('수업을 찾을 수 없습니다.');
        }

        // 1. 강의에 등록된 모든 수강생을 가져옵니다.
        const enrollments = await Enrollment.findAll({
            where: { course_id: session.course_id },
            include: [{ model: User, attributes: ['id', 'name'] }], // 별칭 제거
            order: [[User, 'name', 'ASC']] // 정렬 기준 변경
        });

        // 2. 해당 세션의 기존 출석 기록을 가져옵니다.
        const existingAttendances = await Attendance.findAll({
            where: { session_id: sessionId }
        });
        const attendanceMap = new Map(existingAttendances.map(att => [att.student_id, att]));

        // 3. 수강생 목록을 기준으로 출석 정보를 조합합니다.
        const displayAttendances = enrollments.map(enrollment => {
            const student = enrollment.User; // .Student -> .User
            const attendance = attendanceMap.get(student.id);
            if (attendance) {
                // 출석 기록이 있으면 그 정보를 사용합니다.
                const attJson = attendance.toJSON();
                return { ...attJson, User: student }; // .Student -> .User
            } else {
                // 없으면 기본값(결석)으로 가상 객체를 만듭니다.
                return {
                    id: null, // DB에 없는 레코드
                    session_id: sessionId,
                    student_id: student.id,
                    status: 3, // 3: 결석
                    checked_at: null,
                    method_used: null,
                    User: student // .Student -> .User
                };
            }
        });

        const summary = {
            present: displayAttendances.filter(a => a.status === 1).length,
            late: displayAttendances.filter(a => a.status === 2).length,
            absent: displayAttendances.filter(a => a.status === 3).length,
            approved_absence: displayAttendances.filter(a => a.status === 4).length,
        };

        res.render('sessions/summary', {
            title: `${session.Course.title} ${session.week}주차 출석 현황`,
            session,
            attendances: displayAttendances, // 조합된 목록을 뷰에 전달
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

// POST /sessions/:sessionId/student/:studentId/attendance - 출석 상태 생성 또는 업데이트
exports.upsertAttendance = async (req, res, next) => {
  try {
    const { sessionId, studentId } = req.params;
    const { status: newStatus, reason } = req.body;
    const instructorId = req.session.user.id;

    // 1. 출석 기록을 찾거나, 없으면 새로 만들 준비를 합니다.
    const [attendance, created] = await Attendance.findOrCreate({
      where: {
        session_id: sessionId,
        student_id: studentId,
      },
      defaults: {
        status: parseInt(newStatus, 10),
        checked_at: new Date(),
        method_used: 'MANUAL'
      }
    });

    const oldStatus = attendance.status;

    // 2. 기록이 새로 생성된 게 아니라면, 상태를 업데이트합니다.
    if (!created) {
      attendance.status = parseInt(newStatus, 10);
      await attendance.save();
    }

    // 3. 감사 로그를 기록합니다.
    await AuditLog.create({
      user_id: instructorId,
      action: created ? 'CREATE_ATTENDANCE_STATUS' : 'UPDATE_ATTENDANCE_STATUS',
      target_type: 'Attendance',
      target_id: attendance.id,
      meta_json: JSON.stringify({ oldStatus, newStatus, reason, sessionId, studentId }),
    });

    // 4. 결석 횟수 확인 및 알림 생성 로직
    if (parseInt(newStatus, 10) === 3) { // '결석'으로 처리된 경우
      const session = await ClassSession.findByPk(sessionId, {
        attributes: ['course_id'],
        include: [{ model: Course, attributes: ['title'] }]
      });

      if (session) {
        const courseId = session.course_id;
        const courseTitle = session.Course.title;

        // 해당 과목의 총 결석 횟수 계산
        const absenceCount = await Attendance.count({
          where: {
            student_id: studentId,
            status: 3 // 3: 결석
          },
          include: [{
            model: ClassSession,
            where: { course_id: courseId },
            attributes: []
          }]
        });

        let notificationMessage = null;
        if (absenceCount === 2) {
          notificationMessage = `[${courseTitle}] 강의에 2회 결석하여 경고 알림이 발송되었습니다. 출결 관리에 유의해 주시기 바랍니다.`;
        } else if (absenceCount === 3) {
          notificationMessage = `[${courseTitle}] 강의에 3회 결석하여 위험 알림이 발송되었습니다. 학점 이수에 문제가 발생할 수 있으니 즉시 확인해 주시기 바랍니다.`;
        }

        if (notificationMessage) {
          await Notification.create({
            user_id: studentId,
            type: 'ABSENCE_WARNING',
            message: notificationMessage,
            link: `/courses/${courseId}/score`
          });
        }
      }
    }

    // 5. 수업 세션의 상태를 'CLOSED'로 변경합니다.
    await ClassSession.update(
      { status: 'CLOSED' },
      { where: { id: sessionId } }
    );

    res.redirect(`/sessions/${sessionId}/attendance/summary`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /sessions/:id/edit - 개별 세션 수정 폼 렌더링
exports.renderEditForm = async (req, res, next) => {
  try {
    const session = await ClassSession.findByPk(req.params.id, {
      include: { model: Course, attributes: ['title', 'instructor_id'] }
    });

    if (!session) {
      return res.status(404).send('수업 세션을 찾을 수 없습니다.');
    }
    // 현재 로그인한 유저가 해당 강의의 교수인지 확인
    if (session.Course.instructor_id !== req.session.user.id) {
      return res.status(403).send('권한이 없습니다.');
    }

    res.render('sessions/edit', { session });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /sessions/:id/edit - 개별 세션 업데이트
exports.updateSession = async (req, res, next) => {
  try {
    const session = await ClassSession.findByPk(req.params.id, {
      include: { model: Course, attributes: ['instructor_id'] }
    });

    if (!session) {
      return res.status(404).send('수업 세션을 찾을 수 없습니다.');
    }
    if (session.Course.instructor_id !== req.session.user.id) {
      return res.status(403).send('권한이 없습니다.');
    }

    const { date, start_at, end_at } = req.body;
    await session.update({ date, start_at, end_at });

    res.redirect(`/courses/${session.course_id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
