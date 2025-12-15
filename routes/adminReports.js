// routes/adminReports.js
const express = require('express');
const { requireRole } = require('../middlewares/authMiddleware');
const { getCourseMetrics } = require('../controllers/adminReportController');

const router = express.Router();

// 관리자 전용 리포트 페이지
router.get('/course-metrics', requireRole(['ADMIN']), /* #swagger.tags = ['Admin Reports']
    #swagger.summary = '전체 강의 통계 조회'
    #swagger.description = '전체 강의에 대한 통계 정보를 조회합니다. (관리자 전용)'
    #swagger.produces = ['text/html']
    #swagger.responses[200] = { description: '통계 페이지 렌더링 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ getCourseMetrics);

router.get('/course-metrics/:courseId', requireRole(['ADMIN']), /* #swagger.tags = ['Admin Reports']
    #swagger.summary = '특정 강의 통계 조회'
    #swagger.description = '특정 강의에 대한 통계 정보를 조회합니다. (관리자 전용)'
    #swagger.produces = ['text/html']
    #swagger.parameters['courseId'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '통계 페이지 렌더링 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '강의를 찾을 수 없음' }
*/ getCourseMetrics); // 특정 과목 조회

module.exports = router;
