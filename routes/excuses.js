// routes/excuses.js
const express = require('express');
const { isLoggedIn, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/fileUpload');
const {
  renderExcuseForm,
  createExcuse,
  getExcuses,
  getExcuseDetails,
  updateExcuseStatus,
  getMyExcuses,
} = require('../controllers/excuseController');

const router = express.Router();

// GET /excuses - 공결 신청 목록 조회 (교수/관리자)
router.get('/', requireRole(['INSTRUCTOR', 'ADMIN']), /* #swagger.tags = ['Excuses']
    #swagger.summary = '공결 신청 목록 조회 (교수/관리자용)'
    #swagger.description = '담당하고 있는 강의의 모든 공결 신청 목록을 조회합니다.'
    #swagger.parameters['status'] = { in: 'query', description: '조회할 상태 (PENDING, APPROVED, REJECTED)', type: 'string' }
    #swagger.responses[200] = { description: '공결 신청 목록 조회 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ getExcuses);

// GET /me/excuses - 내 공결 신청 목록 조회 (학생)
router.get('/me', requireRole(['STUDENT']), /* #swagger.tags = ['Excuses']
    #swagger.summary = '내 공결 신청 목록 조회 (학생용)'
    #swagger.description = '자신이 신청한 모든 공결 신청 목록을 조회합니다.'
    #swagger.responses[200] = { description: '내 공결 신청 목록 조회 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ getMyExcuses);

// GET /excuses/new/session/:sessionId - 공결 신청 폼
router.get('/new/session/:sessionId', requireRole(['STUDENT']), /* #swagger.tags = ['Excuses']
    #swagger.summary = '공결 신청 폼 렌더링'
    #swagger.description = '특정 수업에 대한 공결 신청 폼 페이지를 렌더링합니다.'
    #swagger.produces = ['text/html']
    #swagger.parameters['sessionId'] = { in: 'path', description: '수업 세션 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '페이지 렌더링 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ renderExcuseForm);

// POST /excuses/session/:sessionId - 공결 신청 생성
router.post('/session/:sessionId', requireRole(['STUDENT']), upload.single('excuseFile'), /* #swagger.tags = ['Excuses']
    #swagger.summary = '공결 신청 생성'
    #swagger.description = '특정 수업에 대한 공결 신청을 제출합니다. 증빙 파일을 포함할 수 있습니다.'
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['sessionId'] = { in: 'path', description: '수업 세션 ID', required: true, type: 'integer' }
    #swagger.parameters['formData'] = {
        in: 'formData',
        type: 'object',
        properties: {
            reason_text: { type: 'string', description: '사유 (텍스트)' },
            reason_code: { type: 'string', description: '사유 코드' },
            excuseFile: { type: 'file', description: '증빙 파일' }
        }
    }
    #swagger.responses[201] = { description: '공결 신청 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ createExcuse);

// GET /excuses/:id - 공결 신청 상세
router.get('/:id', isLoggedIn, /* #swagger.tags = ['Excuses']
    #swagger.summary = '특정 공결 신청 상세 조회'
    #swagger.description = '특정 공결 신청의 상세 내역을 조회합니다.'
    #swagger.parameters['id'] = { in: 'path', description: '공결 신청 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '상세 정보 조회 성공' }
    #swagger.responses[401] = { description: '로그인 필요' }
    #swagger.responses[403] = { description: '접근 권한 없음' }
    #swagger.responses[404] = { description: '신청을 찾을 수 없음' }
*/ getExcuseDetails);

// PATCH /excuses/:id - 공결 신청 상태 변경 (승인/반려)
router.patch('/:id', requireRole(['INSTRUCTOR', 'ADMIN']), /* #swagger.tags = ['Excuses']
    #swagger.summary = '공결 신청 상태 변경 (승인/반려)'
    #swagger.description = '접수된 공결 신청을 승인하거나 반려합니다. (강사/관리자 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '공결 신청 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '변경할 상태 정보', required: true, schema: { status: 'APPROVED', review_comment: '확인 완료' } }
    #swagger.responses[200] = { description: '상태 변경 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '신청을 찾을 수 없음' }
*/ updateExcuseStatus);


module.exports = router;
