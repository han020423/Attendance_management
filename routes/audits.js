// routes/audits.js
const express = require('express');
const { requireRole } = require('../middlewares/authMiddleware');
const { getAuditLogs } = require('../controllers/auditController');

const router = express.Router();

// GET /audits - 감사 로그 조회
router.get('/', requireRole(['ADMIN']), getAuditLogs);

module.exports = router;
