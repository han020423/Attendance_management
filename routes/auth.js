// routes/auth.js
const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares/authMiddleware');
const { renderLogin, login, logout, renderRegister, register } = require('../controllers/authController');

const router = express.Router();

// GET /auth/login - 로그인 페이지 렌더링
router.get('/login', isNotLoggedIn, renderLogin);

// POST /auth/login - 로그인 처리
router.post('/login', isNotLoggedIn, login);

// POST /auth/logout - 로그아웃 처리
router.post('/logout', isLoggedIn, logout);

// GET /auth/register - 회원가입 페이지 렌더링
router.get('/register', isNotLoggedIn, renderRegister);

// POST /auth/register - 회원가입 처리
router.post('/register', isNotLoggedIn, register);

module.exports = router;
