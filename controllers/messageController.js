// controllers/messageController.js
const { Message, User, Course, Enrollment, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /messages - 받은 메시지 목록
exports.getReceivedMessages = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      where: { to_user_id: req.session.user.id },
      include: [{ model: User, as: 'FromUser', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.render('messages/list', { title: '받은 메시지', messages });
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
    const instructors = enrollments.map(e => e.Course.Instructor);
    
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
    const { to_user_id, course_id, title, body } = req.body;
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
      await Message.create({
        from_user_id,
        to_user_id,
        title,
        body,
      }, { transaction: t });

      const newNotification = await Notification.create({
        user_id: to_user_id,
        type: 'NEW_MESSAGE',
        message: `${req.session.user.name}님으로부터 새로운 메시지가 도착했습니다.`,
        link: `/messages`
      }, { transaction: t });

      // SSE로 알림 발송
      sendSse(to_user_id, newNotification);
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
    const message = await Message.findOne({
      where: {
        id: req.params.id,
        to_user_id: req.session.user.id, // 본인에게 온 메시지만 확인 가능
      },
      include: [
        { model: User, as: 'FromUser', attributes: ['name', 'email'] },
        Course
      ],
      transaction: t,
    });

    if (!message) {
      return res.status(404).send('메시지를 찾을 수 없거나 권한이 없습니다.');
    }

    // 메시지 읽음 처리
    if (!message.is_read) {
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
