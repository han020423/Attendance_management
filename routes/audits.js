// routes/audits.js
const express = require('express');
const { requireRole } = require('../middlewares/authMiddleware');
const { getAuditLogs } = require('../controllers/auditController');

const router = express.Router();

// GET /audits - 감사 로그 조회
router.get('/', requireRole(['ADMIN']), /* #swagger.tags = ['Audits']
    #swagger.summary = '감사 로그 조회'
    #swagger.description = '시스템의 모든 감사 로그를 조회합니다. (관리자 전용)'
    #swagger.parameters['page'] = { in: 'query', description: '페이지 번호', type: 'integer' }
    #swagger.parameters['target_type'] = { in: 'query', description: '대상 타입 (예: User, Course)', type: 'string' }
    #swagger.parameters['target_id'] = { in: 'query', description: '대상 ID', type: 'integer' }
    #swagger.parameters['actor_id'] = { in: 'query', description: '수행자 ID', type: 'integer' }
    #swagger.responses[200] = { description: '감사 로그 조회 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ getAuditLogs);

module.exports = router;
