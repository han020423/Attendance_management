// routes/messages.js
const express = require('express');
const { isLoggedIn, requireRole } = require('../middlewares/authMiddleware');
const {
  getReceivedMessages,
  renderNewMessageForm,
  createMessage,
  getMessageDetails,
} = require('../controllers/messageController');

const router = express.Router();

// GET /messages - 받은 메시지 목록
router.get('/', isLoggedIn, /* #swagger.tags = ['Messages']
    #swagger.summary = '받은 메시지 목록 조회'
    #swagger.description = '현재 로그인한 사용자가 받은 모든 메시지 목록을 조회합니다.'
    #swagger.responses[200] = { description: '메시지 목록 조회 성공' }
    #swagger.responses[401] = { description: '로그인 필요' }
*/ getReceivedMessages);

// GET /messages/new - 새 메시지 작성 폼
router.get('/new', isLoggedIn, /* #swagger.tags = ['Messages']
    #swagger.summary = '새 메시지 작성 폼 렌더링'
    #swagger.description = '새로운 메시지를 작성하는 폼 페이지를 렌더링합니다.'
    #swagger.produces = ['text/html']
    #swagger.parameters['courseId'] = { in: 'query', description: '강의 ID (선택 사항)', type: 'integer' }
    #swagger.parameters['toUserId'] = { in: 'query', description: '받는 사람 ID (선택 사항)', type: 'integer' }
    #swagger.responses[200] = { description: '페이지 렌더링 성공' }
    #swagger.responses[401] = { description: '로그인 필요' }
*/ renderNewMessageForm);

// POST /messages - 메시지 생성/전송
router.post('/', isLoggedIn, /* #swagger.tags = ['Messages']
    #swagger.summary = '메시지 생성/전송'
    #swagger.description = '새로운 메시지를 특정 사용자(이메일 또는 ID) 또는 강의의 모든 수강생에게 전송합니다.'
    #swagger.parameters['body'] = {
        in: 'body',
        description: '메시지 정보. to_user_email, to_user_id, course_id 중 하나는 반드시 필요합니다.',
        required: true,
        schema: {
            $to_user_email: 'professor@example.com',
            $to_user_id: 1,
            $course_id: 1,
            title: '메시지 제목',
            body: '메시지 내용'
        }
    }
    #swagger.responses[201] = { description: '메시지 전송 성공' }
    #swagger.responses[400] = { description: '잘못된 요청 (예: 수신자 정보 누락)' }
    #swagger.responses[401] = { description: '로그인 필요' }
    #swagger.responses[404] = { description: '수신자 이메일을 찾을 수 없음' }
*/ createMessage);

// GET /messages/:id - 메시지 상세 보기
router.get('/:id', isLoggedIn, /* #swagger.tags = ['Messages']
    #swagger.summary = '메시지 상세 보기'
    #swagger.description = '특정 메시지의 상세 내용을 조회합니다. 조회 시 읽음 처리됩니다.'
    #swagger.parameters['id'] = { in: 'path', description: '메시지 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '메시지 상세 정보 조회 성공' }
    #swagger.responses[401] = { description: '로그인 필요' }
    #swagger.responses[403] = { description: '메시지 접근 권한 없음' }
    #swagger.responses[404] = { description: '메시지를 찾을 수 없음' }
*/ getMessageDetails);


module.exports = router;
