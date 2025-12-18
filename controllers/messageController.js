// controllers/messageController.js
const { Message, User, Course, Enrollment, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /messages - 전체 메시지 목록 (보낸 것 + 받은 것)
exports.getMessageList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15; // 한 페이지에 15개씩 표시
    const offset = (page - 1) * limit;
    const userId = req.session.user.id;

    const { count, rows: messages } = await Message.findAndCountAll({
      where: {
        [Op.or]: [
          { to_user_id: userId },   // 내가 받은 메시지
          { from_user_id: userId }  // 내가 보낸 메시지
        ]
      },
      include: [
        { model: User, as: 'FromUser', attributes: ['name'] },
        { model: User, as: 'ToUser', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.render('messages/list', {
      title: '메시지함',
      messages,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /messages/new - 새 메시지 작성 폼
exports.renderNewMessageForm = async (req, res, next) => {
  try {
    const { courseId, toUserId } = req.query;
    let course, toUser;
    
    // 교원이 강의 전체에게 공지
    if (req.session.user.role === 'INSTRUCTOR') {
      const myCourses = await Course.findAll({ where: { instructor_id: req.session.user.id } });
      return res.render('messages/form', { title: '새 메시지 작성', myCourses });
    }

    // 학생이 교원에게
    const enrollments = await Enrollment.findAll({ 
      where: { user_id: req.session.user.id },
      include: [{ model: Course, include: [{ model: User, as: 'Instructor' }] }]
    });
    const instructors = enrollments
      .map(e => e.Course) // 먼저 Course 객체를 추출
      .filter(course => course != null) // null인 Course 객체(고아 데이터)를 제거
      .map(course => course.Instructor) // 이후 Instructor를 추출
      .filter(instructor => instructor != null); // Instructor가 없는 경우(담당교수 미지정) 제거
    
    res.render('messages/form', { title: '새 메시지 작성', instructors });

  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /messages - 메시지 생성/전송
exports.createMessage = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { to_user_id, to_user_email, course_id, title, body } = req.body;
    const from_user_id = req.session.user.id;
    const sendSse = req.app.get('sendSseNotification');

    // Case 1: 교원이 특정 강의 수강생 전체에게 공지
    if (req.session.user.role === 'INSTRUCTOR' && course_id) {
      const enrollments = await Enrollment.findAll({ where: { course_id } });
      const messages = enrollments.map(e => ({
        from_user_id,
        to_user_id: e.user_id,
        course_id,
        title: `[공지] ${title}`,
        body,
      }));
      await Message.bulkCreate(messages, { transaction: t });
      
      // 알림도 생성
      const notifications = enrollments.map(e => ({
        user_id: e.user_id,
        type: 'NEW_NOTICE',
        message: `새로운 강의 공지가 있습니다: ${title}`,
        link: `/messages` // 메시지함으로 연결
      }));
      await Notification.bulkCreate(notifications, { transaction: t });

      // SSE로 알림 발송
      notifications.forEach(notification => {
        sendSse(notification.user_id, notification);
      });

    } else { // Case 2: 1대1 메시지
      let recipientId;

      // 교수가 이메일로 1대1 메시지를 보내는 경우
      if (req.session.user.role === 'INSTRUCTOR' && to_user_email) {
        const recipient = await User.findOne({ where: { email: to_user_email } });
        if (!recipient) {
          await t.rollback();
          // TODO: 사용자에게 에러를 보여주는 더 나은 방법 (예: flash 메시지)
          return res.status(404).send('<script>alert("해당 이메일의 사용자를 찾을 수 없습니다."); window.history.back();</script>');
        }
        recipientId = recipient.id;
      } else if (to_user_id) {
        // 학생이 교수에게 보내거나, 다른 방식으로 ID가 넘어온 경우
        recipientId = to_user_id;
      }

      if (!recipientId) {
        await t.rollback();
        return res.status(400).send('<script>alert("메시지를 보낼 대상을 지정해야 합니다."); window.history.back();</script>');
      }

      await Message.create({
        from_user_id,
        to_user_id: recipientId,
        title,
        body,
      }, { transaction: t });

      const newNotification = await Notification.create({
        user_id: recipientId,
        type: 'NEW_MESSAGE',
        message: `${req.session.user.name}님으로부터 새로운 메시지가 도착했습니다.`,
        link: `/messages`
      }, { transaction: t });

      // SSE로 알림 발송
      sendSse(recipientId, newNotification);
    }

    await t.commit();
    res.redirect('/messages');
  } catch (error) {
    await t.rollback();
    console.error(error);
    next(error);
  }
};

// GET /messages/:id - 메시지 상세 보기
exports.getMessageDetails = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.session.user.id;
    const message = await Message.findOne({
      where: {
        id: req.params.id,
        // 내가 받거나 또는 보낸 메시지인지 확인
        [Op.or]: [
          { to_user_id: userId },
          { from_user_id: userId }
        ]
      },
      include: [
        { model: User, as: 'FromUser', attributes: ['name', 'email'] },
        { model: User, as: 'ToUser', attributes: ['name', 'email'] }, // 받는 사람 정보도 추가
        Course
      ],
      transaction: t,
    });

    if (!message) {
      await t.rollback();
      return res.status(404).send('메시지를 찾을 수 없거나 권한이 없습니다.');
    }

    // 내가 받은 메시지인 경우에만 읽음 처리
    if (!message.is_read && message.to_user_id === userId) {
      message.is_read = true;
      await message.save({ transaction: t });
    }
    
    await t.commit();
    res.render('messages/details', { title: '메시지 상세', message });
  } catch (error) {
    await t.rollback();
    console.error(error);
    next(error);
  }
};
