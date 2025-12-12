// controllers/voteController.js
const { Vote, VoteOption, VoteResponse, Course, Notification, Enrollment, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /votes/course/:courseId - 특정 강의의 투표 목록
exports.getCourseVotes = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByPk(courseId);
    const votes = await Vote.findAll({
      where: { course_id: courseId },
      order: [['createdAt', 'DESC']],
    });
    res.render('votes/list', { title: `${course.title} - 투표 목록`, votes, course });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /votes/new/course/:courseId - 투표 생성 폼
exports.renderVoteForm = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByPk(courseId);
    res.render('votes/form', { title: '새 투표 생성', course });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /votes/course/:courseId - 투표 생성
exports.createVote = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { courseId } = req.params;
    const { title, description, options, closes_at } = req.body; // options는 배열
    const sendSse = req.app.get('sendSseNotification');

    const vote = await Vote.create({
      course_id: courseId,
      title,
      description,
      closes_at: closes_at || null, // 빈 문자열이 오면 null로 저장
    }, { transaction: t });

    const optionObjects = (options || []).filter(opt => opt.trim() !== '').map(opt => ({
      vote_id: vote.id,
      label: opt,
    }));

    if (optionObjects.length < 2) {
      throw new Error('투표 항목은 최소 2개 이상이어야 합니다.');
    }

    await VoteOption.bulkCreate(optionObjects, { transaction: t });

    // 수강생들에게 알림
    const enrollments = await Enrollment.findAll({ where: { course_id: courseId } });
    const notifications = enrollments.map(e => ({
      user_id: e.user_id,
      type: 'NEW_VOTE',
      message: `[${title}] 새로운 투표가 생성되었습니다.`,
      link: `/votes/${vote.id}`,
    }));
    await Notification.bulkCreate(notifications, { transaction: t });

    // SSE로 알림 발송
    notifications.forEach(notification => {
      sendSse(notification.user_id, notification);
    });

    await t.commit();
    res.redirect(`/votes/course/${courseId}`);
  } catch (error) {
    await t.rollback();
    console.error(error);
    next(error);
  }
};

// GET /votes/:id - 투표 상세 및 참여
exports.getVote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;

    const vote = await Vote.findByPk(id, {
      include: [
        Course,
        { model: VoteOption, include: [VoteResponse] },
      ],
    });

    if (!vote) {
      return res.status(404).send('투표를 찾을 수 없습니다.');
    }

    // 마감 시간이 지났으면 자동으로 상태 변경
    if (vote.closes_at && vote.closes_at < new Date() && vote.status === 'OPEN') {
      vote.status = 'CLOSED';
      await vote.save();
    }

    const userResponse = await VoteResponse.findOne({ where: { vote_id: id, student_id: userId } });

    // 투표 결과 집계
    const results = vote.VoteOptions.map(option => ({
      label: option.label,
      count: option.VoteResponses.length,
    }));
    const totalResponses = results.reduce((sum, r) => sum + r.count, 0);

    res.render('votes/details', {
      title: vote.title,
      vote,
      userResponse, // 사용자가 이미 투표했는지 여부
      results,
      totalResponses,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /votes/:id/respond - 투표 제출
exports.submitVote = async (req, res, next) => {
  try {
    const { id: vote_id } = req.params;
    const { option_id } = req.body;
    const student_id = req.session.user.id;

    const existingResponse = await VoteResponse.findOne({ where: { vote_id, student_id } });
    if (existingResponse) {
      return res.status(400).send('이미 투표에 참여했습니다.');
    }

    await VoteResponse.create({
      vote_id,
      option_id,
      student_id,
    });

    res.redirect(`/votes/${vote_id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
