// routes/courses.js
const express = require('express');
const { isLoggedIn, requireRole } = require('../middlewares/authMiddleware');
const {
  getMyCourses,
  getCourseDetails,
  createSessions,
  renderPolicyForm,
  updatePolicy,
  getAttendanceScore,
  renderEnrollmentPage,
  addStudentToCourse,
  removeStudentFromCourse,
} = require('../controllers/courseController');

const router = express.Router();

// GET /courses - 자신의 강의 목록 조회
router.get('/', isLoggedIn, /* #swagger.tags = ['Courses']
    #swagger.summary = '자신이 수강/강의하는 강의 목록 조회'
    #swagger.description = '현재 로그인한 사용자가 수강하거나 강의하는 모든 강의 목록을 조회합니다.'
    #swagger.responses[200] = { description: '강의 목록 조회 성공' }
    #swagger.responses[401] = { description: '로그인 필요' }
*/ getMyCourses);

// GET /courses/:id - 특정 강의 상세 정보
router.get('/:id', isLoggedIn, /* #swagger.tags = ['Courses']
    #swagger.summary = '특정 강의 상세 정보 조회'
    #swagger.description = '특정 강의의 상세 정보를 조회합니다.'
    #swagger.parameters['id'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '강의 상세 정보 조회 성공' }
    #swagger.responses[401] = { description: '로그인 필요' }
    #swagger.responses[403] = { description: '강의 접근 권한 없음' }
    #swagger.responses[404] = { description: '강의를 찾을 수 없음' }
*/ getCourseDetails);

// POST /courses/:id/sessions - 수업 일정 일괄 생성
router.post('/:id/sessions', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Courses']
    #swagger.summary = '수업 일정 일괄 생성'
    #swagger.description = '특정 강의에 대한 전체 학기 수업 일정을 일괄 생성합니다. (강사 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '수업 일정 생성 정보', required: true, schema: { startDate: '2025-03-03', weeks: 15, dayOfWeek: 1, startTime: '10:30', endTime: '12:00' } }
    #swagger.responses[201] = { description: '수업 일정 생성 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ createSessions);

// GET /courses/:id/policy - 정책 관리 페이지
router.get('/:id/policy', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Courses']
    #swagger.summary = '출석 정책 관리 페이지 렌더링'
    #swagger.description = '강의의 출석 정책을 관리하는 페이지를 렌더링합니다. (강사 전용)'
    #swagger.produces = ['text/html']
    #swagger.parameters['id'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '페이지 렌더링 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ renderPolicyForm);

// POST /courses/:id/policy - 정책 업데이트
router.post('/:id/policy', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Courses']
    #swagger.summary = '출석 정책 업데이트'
    #swagger.description = '강의의 출석 정책(지각, 결석 처리 기준 등)을 업데이트합니다. (강사 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '업데이트할 정책 정보', required: true, schema: { late_penalty_points: 0.5, absence_penalty_points: 1, lates_for_absence: 2 } }
    #swagger.responses[200] = { description: '정책 업데이트 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ updatePolicy);

// GET /courses/:id/score - 내 출석 점수 보기
router.get('/:id/score', requireRole(['STUDENT']), /* #swagger.tags = ['Courses']
    #swagger.summary = '내 출석 점수 보기'
    #swagger.description = '특정 강의에서의 나의 현재 출석 점수를 확인합니다. (학생 전용)'
    #swagger.produces = ['text/html']
    #swagger.parameters['id'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '페이지 렌더링 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ getAttendanceScore);

// GET /courses/:id/enrollments - 수강생 관리 페이지
router.get('/:id/enrollments', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Courses']
    #swagger.summary = '수강생 관리 페이지 렌더링'
    #swagger.description = '강의에 등록된 수강생 목록을 관리하는 페이지를 렌더링합니다. (강사 전용)'
    #swagger.produces = ['text/html']
    #swagger.parameters['id'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '페이지 렌더링 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ renderEnrollmentPage);

// POST /courses/:id/enrollments - 학생 추가
router.post('/:id/enrollments', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Courses']
    #swagger.summary = '강의에 학생 추가'
    #swagger.description = '이메일을 이용해 특정 학생을 강의에 수강생으로 추가합니다. (강사 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '추가할 학생 이메일', required: true, schema: { student_email: 'student@example.com' } }
    #swagger.responses[200] = { description: '학생 추가 성공' }
    #swagger.responses[400] = { description: '잘못된 요청 (예: 이미 추가된 학생)' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '학생을 찾을 수 없음' }
*/ addStudentToCourse);

// POST /courses/:courseId/enrollments/:enrollmentId/delete - 학생 삭제
router.post('/:courseId/enrollments/:enrollmentId/delete', requireRole(['INSTRUCTOR']), /* #swagger.tags = ['Courses']
    #swagger.summary = '강의에서 학생 삭제'
    #swagger.description = '강의에서 특정 학생의 수강 등록을 취소합니다. (강사 전용)'
    #swagger.parameters['courseId'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.parameters['enrollmentId'] = { in: 'path', description: '수강 등록 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '학생 삭제 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '수강 정보를 찾을 수 없음' }
*/ removeStudentFromCourse);


module.exports = router;
