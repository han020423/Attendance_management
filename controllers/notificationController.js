// controllers/notificationController.js
const { Notification } = require('../models');

// GET /me/notifications - 내 알림 목록 조회
exports.getNotifications = async (req, res, next) => {
  try {
    // 사용자의 모든 읽지 않은 알림을 읽음으로 표시
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.session.user.id, is_read: false } }
    );

    const notifications = await Notification.findAll({
      where: { user_id: req.session.user.id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    res.render('notifications/list', { title: '내 알림', notifications });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// PATCH /me/notifications/:id/read - 알림 읽음 처리
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.session.user.id },
    });
    if (notification) {
      notification.is_read = true;
      await notification.save();
      res.status(200).json({ message: '읽음 처리되었습니다.' });
    } else {
      res.status(404).json({ message: '알림을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
