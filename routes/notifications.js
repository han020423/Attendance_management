// routes/notifications.js
const express = require('express');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

const router = express.Router();

// GET /me/notifications - 내 알림 목록 조회
router.get('/', isLoggedIn, /* #swagger.tags = ['Notifications']
    #swagger.summary = '내 알림 목록 조회'
    #swagger.description = '로그인한 사용자의 모든 알림을 조회합니다.'
    #swagger.responses[200] = { description: '알림 목록 조회 성공' }
    #swagger.responses[401] = { description: '로그인 필요' }
*/ getNotifications);

// PATCH /me/notifications/:id/read - 알림 읽음 처리
router.patch('/:id/read', isLoggedIn, /* #swagger.tags = ['Notifications']
    #swagger.summary = '특정 알림 읽음 처리'
    #swagger.description = '특정 알림을 읽음 상태로 변경합니다.'
    #swagger.parameters['id'] = { in: 'path', description: '알림 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '알림 읽음 처리 성공' }
    #swagger.responses[401] = { description: '로그인 필요' }
    #swagger.responses[404] = { description: '알림을 찾을 수 없음' }
*/ markAsRead);

module.exports = router;
