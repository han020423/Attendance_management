// routes/sessions.js
const express = require('express');
const { isLoggedIn, requireRole } = require('../middlewares/authMiddleware');
const {
  openAttendance,
  closeAttendance,
  handleAttendance,
  getAttendanceSummary,
  updateAttendanceStatus,
  upsertAttendance,
  renderEditForm,
  updateSession,
} = require('../controllers/sessionController');

const router = express.Router();

// GET /sessions/:id/edit - 개별 세션 수정 폼
router.get('/:id/edit', requireRole(['INSTRUCTOR']), renderEditForm);

// POST /sessions/:id/edit - 개별 세션 업데이트
router.post('/:id/edit', requireRole(['INSTRUCTOR']), updateSession);

// POST /sessions/:id/open - 출석 시작
router.post('/:id/open', requireRole(['INSTRUCTOR']), openAttendance);

// POST /sessions/:id/close - 출석 마감
router.post('/:id/close', requireRole(['INSTRUCTOR']), closeAttendance);

// POST /sessions/:id/attend - 학생 출석 처리
router.post('/:id/attend', requireRole(['STUDENT']), handleAttendance);

// GET /sessions/:id/attendance/summary - 출석 현황 요약
router.get('/:id/attendance/summary', requireRole(['INSTRUCTOR']), getAttendanceSummary);

// POST /sessions/:sessionId/student/:studentId/attendance - 출석 상태 생성 또는 업데이트
router.post('/:sessionId/student/:studentId/attendance', requireRole(['INSTRUCTOR']), upsertAttendance);

// POST /sessions/:sessionId/attendance/:attendanceId/update - 출석 상태 수동 변경
router.post('/:sessionId/attendance/:attendanceId/update', requireRole(['INSTRUCTOR']), updateAttendanceStatus);


module.exports = router;
