// routes/auth.js
const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares/authMiddleware');
const { renderLogin, login, logout, renderRegister, register } = require('../controllers/authController');

const router = express.Router();

// GET /auth/login - 로그인 페이지 렌더링
router.get('/login', isNotLoggedIn, /* #swagger.tags = ['Auth']
    #swagger.summary = '로그인 페이지 렌더링'
    #swagger.description = '로그인 폼이 있는 HTML 페이지를 렌더링합니다.'
    #swagger.produces = ['text/html']
    #swagger.responses[200] = { description: '로그인 페이지 렌더링 성공' }
*/ renderLogin);

// POST /auth/login - 로그인 처리
router.post('/login', isNotLoggedIn, /* #swagger.tags = ['Auth']
    #swagger.summary = '사용자 로그인'
    #swagger.description = '사용자의 이메일과 비밀번호를 받아 로그인 처리 후 세션에 사용자 정보를 저장합니다.'
    #swagger.parameters['body'] = {
            in: 'body',
            description: '로그인 정보',
            required: true,
            schema: { email: 'user@example.com', password: 'password123' }
    }
    #swagger.responses[200] = { description: '로그인 성공. 대시보드로 리다이렉트됩니다.' }
    #swagger.responses[401] = { description: '인증 실패. 이메일 또는 비밀번호가 올바르지 않습니다.' }
*/ login);

// POST /auth/logout - 로그아웃 처리
router.post('/logout', isLoggedIn, /* #swagger.tags = ['Auth']
    #swagger.summary = '사용자 로그아웃'
    #swagger.description = '현재 로그인된 사용자의 세션을 파기하고 로그아웃 처리합니다.'
    #swagger.responses[200] = { description: '로그아웃 성공' }
    #swagger.responses[401] = { description: '로그인되지 않은 사용자' }
*/ logout);

// GET /auth/register - 회원가입 페이지 렌더링
router.get('/register', isNotLoggedIn, /* #swagger.tags = ['Auth']
    #swagger.summary = '회원가입 페이지 렌더링'
    #swagger.description = '회원가입 폼이 있는 HTML 페이지를 렌더링합니다.'
    #swagger.produces = ['text/html']
    #swagger.responses[200] = { description: '회원가입 페이지 렌더링 성공' }
*/ renderRegister);

// POST /auth/register - 회원가입 처리
router.post('/register', isNotLoggedIn, /* #swagger.tags = ['Auth']
    #swagger.summary = '신규 사용자 회원가입'
    #swagger.description = '새로운 사용자를 시스템에 등록합니다.'
    #swagger.parameters['body'] = {
            in: 'body',
            description: '회원가입 정보',
            required: true,
            schema: { name: '홍길동', email: 'newuser@example.com', password: 'password123', role: 'STUDENT' }
    }
    #swagger.responses[201] = { description: '회원가입 성공' }
    #swagger.responses[400] = { description: '잘못된 요청 (예: 필수 필드 누락)' }
    #swagger.responses[403] = { description: '관리자 역할로 가입 시도' }
    #swagger.responses[409] = { description: '이미 존재하는 이메일' }
*/ register);

module.exports = router;
