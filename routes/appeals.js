// routes/appeals.js
const express = require('express');
const { isLoggedIn, requireRole } = require('../middlewares/authMiddleware');
const {
  createAppeal,
  getAppeals,
  getAppealDetails,
  updateAppealStatus,
} = require('../controllers/appealController');

const router = express.Router();

// GET /appeals - 이의 신청 목록 조회
router.get('/', requireRole(['INSTRUCTOR', 'ADMIN']), /* #swagger.tags = ['Appeals']
    #swagger.summary = '이의 신청 목록 조회'
    #swagger.description = '교수 또는 관리자가 접수된 이의 신청 목록을 조회합니다.'
    #swagger.responses[200] = { description: '이의 신청 목록 조회 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ getAppeals);

// GET /appeals/:id - 이의 신청 상세 보기
router.get('/:id', requireRole(['INSTRUCTOR', 'ADMIN']), /* #swagger.tags = ['Appeals']
    #swagger.summary = '특정 이의 신청 상세 보기'
    #swagger.description = '교수 또는 관리자가 특정 이의 신청의 상세 내역을 조회합니다.'
    #swagger.parameters['id'] = { in: 'path', description: '이의 신청 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '이의 신청 상세 정보 조회 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '이의 신청을 찾을 수 없음' }
*/ getAppealDetails);

// POST /appeals/attendance/:attendanceId - 이의 신청 생성
router.post('/attendance/:attendanceId', requireRole(['STUDENT']), /* #swagger.tags = ['Appeals']
    #swagger.summary = '출석에 대한 이의 신청 생성'
    #swagger.description = '학생이 특정 출석 기록에 대해 이의를 신청합니다.'
    #swagger.parameters['attendanceId'] = { in: 'path', description: '출석 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '이의 신청 내용', required: true, schema: { message: '출석이 잘못 처리되었습니다.' } }
    #swagger.responses[201] = { description: '이의 신청 생성 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '출석 기록을 찾을 수 없음' }
*/ createAppeal);

// PATCH /appeals/:id - 이의 신청 상태 변경
router.patch('/:id', requireRole(['INSTRUCTOR', 'ADMIN']), /* #swagger.tags = ['Appeals']
    #swagger.summary = '이의 신청 상태 변경'
    #swagger.description = '교수 또는 관리자가 이의 신청을 승인하거나 거절합니다.'
    #swagger.parameters['id'] = { in: 'path', description: '이의 신청 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '변경할 상태 정보', required: true, schema: { status: 'APPROVED', review_comment: '확인 완료', new_attendance_status: 1 } }
    #swagger.responses[200] = { description: '상태 변경 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '이의 신청을 찾을 수 없음' }
*/ updateAppealStatus);

module.exports = router;
