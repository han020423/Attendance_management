// controllers/appealController.js
const { AttendanceAppeal, Attendance, Notification, AuditLog, User, ClassSession, Course, sequelize } = require('../models');

// POST /appeals/attendance/:attendanceId - 이의 신청 생성
exports.createAppeal = async (req, res, next) => {
  try {
    const { attendanceId } = req.params;
    const { message } = req.body;
    const student_id = req.session.user.id;

    // 본인의 출석 기록에 대해서만 신청 가능하도록 체크
    const attendance = await Attendance.findByPk(attendanceId);
    if (!attendance || attendance.student_id !== student_id) {
        return res.status(403).send('자신의 출석 기록에 대해서만 이의신청할 수 있습니다.');
    }

    await AttendanceAppeal.create({
      attendance_id: attendanceId,
      student_id,
      message,
    });

    res.redirect('/me/dashboard'); // 또는 출석부 페이지로
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /appeals - 이의 신청 목록 조회
exports.getAppeals = async (req, res, next) => {
  try {
    // 교원은 자기 과목의 신청만 보도록 필터링
    const instructorCourses = await Course.findAll({ where: { instructor_id: req.session.user.id }});
    const courseIds = instructorCourses.map(c => c.id);

    const appeals = await AttendanceAppeal.findAll({
      include: [
        { model: User, as: 'Student', attributes: ['name'] },
        { 
          model: Attendance, 
          required: true,
          include: [{ 
            model: ClassSession, 
            required: true,
            where: { course_id: { [sequelize.Op.in]: courseIds } },
            include: [{
              model: Course,
              attributes: ['title']
            }]
          }] 
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.render('appeals/list', { title: '이의 신청 관리', appeals });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /appeals/:id - 이의 신청 상세 보기
exports.getAppealDetails = async (req, res, next) => {
  try {
    const appeal = await AttendanceAppeal.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Student', attributes: ['name', 'email'] },
        { model: User, as: 'Reviewer', attributes: ['name'] },
        {
          model: Attendance,
          include: [{
            model: ClassSession,
            include: [Course]
          }]
        }
      ]
    });
    if (!appeal) {
      return res.status(404).send('신청을 찾을 수 없습니다.');
    }
    // 권한 체크 (담당교수, 관리자만)
    const instructorId = appeal.Attendance.ClassSession.Course.instructor_id;
    if (req.session.user.role !== 'ADMIN' && req.session.user.id !== instructorId) {
        return res.status(403).send('권한이 없습니다.');
    }

    res.render('appeals/details', { title: '이의 신청 상세', appeal });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


// PATCH /appeals/:id - 이의 신청 상태 변경
exports.updateAppealStatus = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, review_comment, new_attendance_status } = req.body;
    const reviewer_id = req.session.user.id;

    const appeal = await AttendanceAppeal.findByPk(id, { include: [Attendance] });
    if (!appeal) {
      return res.status(404).send('신청을 찾을 수 없습니다.');
    }

    appeal.status = status;
    appeal.reviewed_by = reviewer_id;
    appeal.review_comment = review_comment;
    await appeal.save({ transaction: t });

    if (status === 'APPROVED' && new_attendance_status) {
      const attendance = await Attendance.findByPk(appeal.attendance_id);
      attendance.status = new_attendance_status;
      attendance.updated_by = reviewer_id;
      await attendance.save({ transaction: t });
    }

    await Notification.create({
      user_id: appeal.student_id,
      type: 'APPEAL_RESULT',
      message: `출석 이의 신청이 ${status === 'APPROVED' ? '처리' : '반려'}되었습니다.`,
      link: `/appeals/${id}`, // 상세 페이지 링크
    }, { transaction: t });

    await AuditLog.create({
      actor_id: reviewer_id,
      action: `APPEAL_${status}`,
      target_type: 'AttendanceAppeal',
      target_id: id,
      meta_json: JSON.stringify({ review_comment, new_attendance_status }),
    }, { transaction: t });

    await t.commit();
    res.redirect(`/appeals/${id}`);
  } catch (error) {
    await t.rollback();
    console.error(error);
    next(error);
  }
};