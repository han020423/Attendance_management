// routes/adminReports.js
const express = require('express');
const { requireRole } = require('../middlewares/authMiddleware');
const { getCourseMetrics } = require('../controllers/adminReportController');

const router = express.Router();

// 관리자 전용 리포트 페이지
router.get('/course-metrics', requireRole(['ADMIN']), getCourseMetrics);
router.get('/course-metrics/:courseId', requireRole(['ADMIN']), getCourseMetrics); // 특정 과목 조회

module.exports = router;
