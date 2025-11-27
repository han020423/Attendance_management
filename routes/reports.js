// routes/reports.js
const express = require('express');
const { requireRole } = require('../middlewares/authMiddleware');
const { getAttendanceReport } = require('../controllers/reportController');

const router = express.Router();

// GET /reports/attendance - 출석 통계 리포트
router.get('/attendance', requireRole(['INSTRUCTOR', 'ADMIN']), getAttendanceReport);

module.exports = router;
