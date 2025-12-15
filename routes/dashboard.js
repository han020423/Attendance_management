// routes/dashboard.js
const express = require('express');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const { getDashboard } = require('../controllers/dashboardController');

const router = express.Router();

// GET /me/dashboard - 역할별 대시보드
router.get('/', isLoggedIn, /* #swagger.tags = ['Dashboard']
    #swagger.summary = '역할별 대시보드 조회'
    #swagger.description = '로그인한 사용자의 역할(학생/강사/관리자)에 맞는 대시보드 페이지를 렌더링합니다.'
    #swagger.produces = ['text/html']
    #swagger.responses[200] = { description: '대시보드 렌더링 성공' }
    #swagger.responses[401] = { description: '로그인 필요' }
*/ getDashboard);

module.exports = router;
