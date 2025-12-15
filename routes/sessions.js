// routes/sessions.js
const express = require('express');
const { isLoggedIn, requireRole } = require('../middlewares/authMiddleware');
const {
  openAttendance,
  closeAttendance,
  handleAttendance,
  getAttendanceSummary,
  updateAttendanceStatus,
  upsertAttendance,
  renderEditForm,
  updateSession,
} = require('../controllers/sessionController');

const router = express.Router();

// GET /sessions/:id/edit - 개별 세션 수정 폼
router.get('/:id/edit', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Sessions']
    #swagger.summary = '개별 수업(세션) 수정 폼 렌더링'
    #swagger.description = '특정 수업 세션의 정보를 수정하는 폼 페이지를 렌더링합니다. (강사 전용)'
    #swagger.produces = ['text/html']
    #swagger.parameters['id'] = { in: 'path', description: '세션 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '페이지 렌더링 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '세션을 찾을 수 없음' }
*/ renderEditForm);

// POST /sessions/:id/edit - 개별 세션 업데이트
router.post('/:id/edit', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Sessions']
    #swagger.summary = '개별 수업(세션) 정보 업데이트'
    #swagger.description = '특정 수업 세션의 정보를 업데이트합니다. (강사 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '세션 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '업데이트할 세션 정보', required: true, schema: { date: '2025-03-03', start_at: '10:30', end_at: '12:00', room: '공학관 501호', is_holiday: false } }
    #swagger.responses[200] = { description: '세션 정보 업데이트 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '세션을 찾을 수 없음' }
*/ updateSession);

// POST /sessions/:id/open - 출석 시작
router.post('/:id/open', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Sessions']
    #swagger.summary = '출석 시작'
    #swagger.description = '특정 수업 세션의 출석을 시작하고 PIN 코드를 생성합니다. (강사 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '세션 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '출석 시작 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '세션을 찾을 수 없음' }
*/ openAttendance);

// POST /sessions/:id/close - 출석 마감
router.post('/:id/close', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Sessions']
    #swagger.summary = '출석 마감'
    #swagger.description = '특정 수업 세션의 출석을 마감합니다. (강사 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '세션 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '출석 마감 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '세션을 찾을 수 없음' }
*/ closeAttendance);

// POST /sessions/:id/attend - 학생 출석 처리
router.post('/:id/attend', requireRole(['STUDENT']), /* #swagger.tags = ['Sessions']
    #swagger.summary = '학생 출석 처리'
    #swagger.description = '학생이 출석 코드를 입력하여 출석을 시도합니다. (학생 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '세션 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '출석 정보', required: true, schema: { method: 'PIN', pin: '123456' } }
    #swagger.responses[200] = { description: '출석 처리 성공' }
    #swagger.responses[400] = { description: '잘못된 요청 (예: PIN 불일치)' }
    #swagger.responses[403] = { description: '권한 없음 (예: 출석 시간이 아님)' }
*/ handleAttendance);

// GET /sessions/:id/attendance/summary - 출석 현황 요약
router.get('/:id/attendance/summary', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Sessions']
    #swagger.summary = '출석 현황 요약 페이지 렌더링'
    #swagger.description = '특정 수업 세션의 출석 현황 요약 페이지를 렌더링합니다. (강사 전용)'
    #swagger.produces = ['text/html']
    #swagger.parameters['id'] = { in: 'path', description: '세션 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '페이지 렌더링 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '세션을 찾을 수 없음' }
*/ getAttendanceSummary);

// POST /sessions/:sessionId/student/:studentId/attendance - 출석 상태 생성 또는 업데이트
router.post('/:sessionId/student/:studentId/attendance', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Sessions']
    #swagger.summary = '특정 학생 출석 상태 수동 변경 (Upsert)'
    #swagger.description = '강사가 특정 학생의 출석 상태를 수동으로 생성하거나 업데이트합니다. (강사 전용)'
    #swagger.parameters['sessionId'] = { in: 'path', description: '세션 ID', required: true, type: 'integer' }
    #swagger.parameters['studentId'] = { in: 'path', description: '학생 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '변경할 출석 상태', required: true, schema: { status: 1 } }
    #swagger.responses[200] = { description: '출석 상태 변경 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ upsertAttendance);

// POST /sessions/:sessionId/attendance/:attendanceId/update - 출석 상태 수동 변경
router.post('/:sessionId/attendance/:attendanceId/update', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Sessions']
    #swagger.summary = '기존 출석 기록 수동 변경'
    #swagger.description = '강사가 기존에 생성된 출석 기록의 상태를 수동으로 변경합니다. (강사 전용)'
    #swagger.parameters['sessionId'] = { in: 'path', description: '세션 ID', required: true, type: 'integer' }
    #swagger.parameters['attendanceId'] = { in: 'path', description: '출석 기록 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '변경할 출석 상태', required: true, schema: { status: 2, reason: '사유 입력' } }
    #swagger.responses[200] = { description: '출석 상태 변경 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '출석 기록을 찾을 수 없음' }
*/ updateAttendanceStatus);


module.exports = router;
