// controllers/excuseController.js
const { ExcuseRequest, ExcuseFile, ClassSession, Course, Attendance, Notification, AuditLog, sequelize, User } = require('../models');

// GET /excuses/new/session/:sessionId - 공결 신청 폼
exports.renderExcuseForm = async (req, res, next) => {
  try {
    const session = await ClassSession.findByPk(req.params.sessionId, { include: [Course] });
    res.render('excuses/form', { title: '공결 신청', session });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /excuses/session/:sessionId - 공결 신청 생성
exports.createExcuse = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { sessionId } = req.params;
    const { reason_text, reason_code } = req.body;
    const student_id = req.session.user.id;

    const excuse = await ExcuseRequest.create({
      session_id: sessionId,
      student_id,
      reason_text,
      reason_code,
    }, { transaction: t });

    if (req.file) {
      await ExcuseFile.create({
        excuse_id: excuse.id,
        file_path: req.file.path,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
      }, { transaction: t });
    }

    await t.commit();
    res.redirect('/me/dashboard');
  } catch (error) {
    await t.rollback();
    console.error(error);
    next(error);
  }
};

// GET /excuses - 공결 신청 목록 조회
exports.getExcuses = async (req, res, next) => {
  try {
    const { status } = req.query; // 'PENDING', 'APPROVED', 'REJECTED'
    const where = {};
    if (status) {
      where.status = status;
    }
    // 교원은 자기 과목의 신청만 보도록 필터링 필요 (추가 구현)
    const excuses = await ExcuseRequest.findAll({
      where,
      include: [
        { model: User, as: 'Student', attributes: ['name'] },
        { model: ClassSession, include: [{ model: Course, attributes: ['title'] }] }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.render('excuses/list', { title: '공결 신청 관리', excuses });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /me/excuses - 내 공결 신청 목록 조회
exports.getMyExcuses = async (req, res, next) => {
  try {
    const student_id = req.session.user.id;
    const excuses = await ExcuseRequest.findAll({
      where: { student_id },
      include: [
        {
          model: ClassSession,
          include: [{ model: Course, attributes: ['title'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.render('excuses/my_list', { title: '내 공결 신청 내역', excuses });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /excuses/:id - 공결 신청 상세
exports.getExcuseDetails = async (req, res, next) => {
    try {
        const excuse = await ExcuseRequest.findByPk(req.params.id, {
            include: [
                { model: User, as: 'Student', attributes: ['name', 'email'] },
                { model: User, as: 'Reviewer', attributes: ['name'] },
                { model: ClassSession, include: [{ model: Course, attributes: ['title'] }] },
                ExcuseFile,
            ]
        });
        if (!excuse) {
            return res.status(404).send('신청을 찾을 수 없습니다.');
        }
        // 권한 체크 (본인, 담당교수, 관리자만)
        res.render('excuses/details', { title: '공결 신청 상세', excuse });
    } catch (error) {
        console.error(error);
        next(error);
    }
};


// PATCH /excuses/:id - 공결 신청 상태 변경
exports.updateExcuseStatus = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, review_comment } = req.body; // 'APPROVED' or 'REJECTED'
    const reviewer_id = req.session.user.id;

    const excuse = await ExcuseRequest.findByPk(id, { include: [ClassSession] });
    if (!excuse) {
      return res.status(404).send('신청을 찾을 수 없습니다.');
    }

    excuse.status = status;
    excuse.reviewed_by = reviewer_id;
    excuse.review_comment = review_comment;
    await excuse.save({ transaction: t });

    if (status === 'APPROVED') {
      await Attendance.update(
        { status: 4 }, // 4: 공결
        { where: { session_id: excuse.session_id, student_id: excuse.student_id }, transaction: t }
      );
    }

    await Notification.create({
      user_id: excuse.student_id,
      type: 'EXCUSE_RESULT',
      message: `공결 신청이 ${status === 'APPROVED' ? '승인' : '반려'}되었습니다.`,
      link: `/excuses/${id}`,
    }, { transaction: t });

    await AuditLog.create({
      actor_id: reviewer_id,
      action: `EXCUSE_REQUEST_${status}`,
      target_type: 'ExcuseRequest',
      target_id: id,
      meta_json: JSON.stringify({ review_comment }),
    }, { transaction: t });

    await t.commit();
    res.redirect(`/excuses/${id}`);
  } catch (error) {
    await t.rollback();
    console.error(error);
    next(error);
  }
};
