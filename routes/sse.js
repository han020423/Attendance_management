// routes/sse.js
const express = require('express');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const { connect } = require('../controllers/sseController');

const router = express.Router();

// GET /sse/connect - SSE 연결 엔드포인트
router.get('/connect', isLoggedIn, /* #swagger.tags = ['SSE']
    #swagger.summary = '실시간 알림 SSE(Server-Sent Events) 연결'
    #swagger.description = '서버로부터 실시간 알림을 받기 위한 SSE 연결을 수립합니다. 이 엔드포인트에 연결하면 서버에서 보내는 이벤트가 스트림으로 전송됩니다.'
    #swagger.produces = ['text/event-stream']
    #swagger.responses[200] = { description: 'SSE 연결 성공. 이벤트 스트림이 시작됩니다.' }
    #swagger.responses[401] = { description: '로그인 필요' }
*/ connect);

module.exports = router;
