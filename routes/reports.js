// routes/reports.js
const express = require('express');
const { requireRole } = require('../middlewares/authMiddleware');
const { getAttendanceReport } = require('../controllers/reportController');

const router = express.Router();

// GET /reports/attendance - 출석 통계 리포트
router.get('/attendance', requireRole(['INSTRUCTOR', 'ADMIN']), /* #swagger.tags = ['Reports']
    #swagger.summary = '출석 통계 리포트 조회'
    #swagger.description = '특정 강의 또는 주차의 출석 통계 리포트 페이지를 렌더링합니다. (강사/관리자 전용)'
    #swagger.produces = ['text/html']
    #swagger.parameters['course_id'] = { in: 'query', description: '강의 ID', type: 'integer' }
    #swagger.parameters['week'] = { in: 'query', description: '주차', type: 'integer' }
    #swagger.responses[200] = { description: '리포트 페이지 렌더링 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ getAttendanceReport);

module.exports = router;
