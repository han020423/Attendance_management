// routes/sse.js
const express = require('express');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const { connect } = require('../controllers/sseController');

const router = express.Router();

// GET /sse/connect - SSE 연결 엔드포인트
router.get('/connect', isLoggedIn, connect);

module.exports = router;
