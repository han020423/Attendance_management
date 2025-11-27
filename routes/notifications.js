// routes/notifications.js
const express = require('express');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

const router = express.Router();

// GET /me/notifications - 내 알림 목록 조회
router.get('/', isLoggedIn, getNotifications);

// PATCH /me/notifications/:id/read - 알림 읽음 처리
router.patch('/:id/read', isLoggedIn, markAsRead);

module.exports = router;
