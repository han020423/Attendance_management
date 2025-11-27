// routes/appeals.js
const express = require('express');
const { isLoggedIn, requireRole } = require('../middlewares/authMiddleware');
const {
  createAppeal,
  getAppeals,
  getAppealDetails,
  updateAppealStatus,
} = require('../controllers/appealController');

const router = express.Router();

// GET /appeals - 이의 신청 목록 조회
router.get('/', requireRole(['INSTRUCTOR', 'ADMIN']), getAppeals);

// GET /appeals/:id - 이의 신청 상세 보기
router.get('/:id', requireRole(['INSTRUCTOR', 'ADMIN']), getAppealDetails);

// POST /appeals/attendance/:attendanceId - 이의 신청 생성
router.post('/attendance/:attendanceId', requireRole(['STUDENT']), createAppeal);

// PATCH /appeals/:id - 이의 신청 상태 변경
router.patch('/:id', requireRole(['INSTRUCTOR', 'ADMIN']), updateAppealStatus);

module.exports = router;
