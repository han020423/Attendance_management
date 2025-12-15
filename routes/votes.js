// routes/votes.js
const express = require('express');
const { requireRole } = require('../middlewares/authMiddleware');
const {
  renderVoteForm,
  createVote,
  getVote,
  submitVote,
  getCourseVotes,
} = require('../controllers/voteController');

const router = express.Router();

// GET /votes/course/:courseId - 특정 강의의 투표 목록
router.get('/course/:courseId', requireRole(['INSTRUCTOR', 'STUDENT']), /* #swagger.tags = ['Votes']
    #swagger.summary = '특정 강의의 투표 목록 조회'
    #swagger.description = '특정 강의에 생성된 모든 투표의 목록을 조회합니다.'
    #swagger.parameters['courseId'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '투표 목록 조회 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ getCourseVotes);

// GET /votes/new/course/:courseId - 투표 생성 폼
router.get('/new/course/:courseId', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Votes']
    #swagger.summary = '투표 생성 폼 렌더링'
    #swagger.description = '새로운 투표를 생성하는 폼 페이지를 렌더링합니다. (강사 전용)'
    #swagger.produces = ['text/html']
    #swagger.parameters['courseId'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '페이지 렌더링 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ renderVoteForm);

// POST /votes/course/:courseId - 투표 생성
router.post('/course/:courseId', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Votes']
    #swagger.summary = '새로운 투표 생성'
    #swagger.description = '특정 강의에 새로운 투표를 생성합니다. (강사 전용)'
    #swagger.parameters['courseId'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = {
        in: 'body',
        description: '생성할 투표 정보',
        required: true,
        schema: {
            title: '중간고사 날짜 투표',
            description: '선호하는 날짜를 선택해주세요.',
            options: ['10월 20일', '10월 21일'],
            closes_at: '2025-09-30T23:59:59'
        }
    }
    #swagger.responses[201] = { description: '투표 생성 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ createVote);

// GET /votes/:id - 투표 상세 및 참여
router.get('/:id', requireRole(['INSTRUCTOR', 'STUDENT']), /* #swagger.tags = ['Votes']
    #swagger.summary = '투표 상세 정보 조회 및 참여 페이지'
    #swagger.description = '특정 투표의 상세 정보를 조회하고, 학생인 경우 투표에 참여할 수 있는 페이지를 렌더링합니다.'
    #swagger.parameters['id'] = { in: 'path', description: '투표 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '투표 상세 정보 조회 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '투표를 찾을 수 없음' }
*/ getVote);

// POST /votes/:id/respond - 투표 제출
router.post('/:id/respond', requireRole(['STUDENT']), /* #swagger.tags = ['Votes']
    #swagger.summary = '투표에 응답 제출'
    #swagger.description = '학생이 특정 투표에 자신의 응답을 제출합니다. (학생 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '투표 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '선택한 옵션 ID', required: true, schema: { option_id: 1 } }
    #swagger.responses[200] = { description: '투표 제출 성공' }
    #swagger.responses[400] = { description: '잘못된 요청 (예: 이미 투표함)' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ submitVote);

module.exports = router;
