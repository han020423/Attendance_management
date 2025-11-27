// routes/excuses.js
const express = require('express');
const { isLoggedIn, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/fileUpload');
const {
  renderExcuseForm,
  createExcuse,
  getExcuses,
  getExcuseDetails,
  updateExcuseStatus,
  getMyExcuses,
} = require('../controllers/excuseController');

const router = express.Router();

// GET /excuses - 공결 신청 목록 조회 (교수/관리자)
router.get('/', requireRole(['INSTRUCTOR', 'ADMIN']), getExcuses);

// GET /me/excuses - 내 공결 신청 목록 조회 (학생)
router.get('/me', requireRole(['STUDENT']), getMyExcuses);

// GET /excuses/new/session/:sessionId - 공결 신청 폼
router.get('/new/session/:sessionId', requireRole(['STUDENT']), renderExcuseForm);

// POST /excuses/session/:sessionId - 공결 신청 생성
router.post('/session/:sessionId', requireRole(['STUDENT']), upload.single('excuseFile'), createExcuse);

// GET /excuses/:id - 공결 신청 상세
router.get('/:id', isLoggedIn, getExcuseDetails);

// PATCH /excuses/:id - 공결 신청 상태 변경 (승인/반려)
router.patch('/:id', requireRole(['INSTRUCTOR', 'ADMIN']), updateExcuseStatus);


module.exports = router;
