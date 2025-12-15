// routes/admin.js
const express = require('express');
const { requireRole } = require('../middlewares/authMiddleware');
const {
  listUsers,
  getUserDetails,
  updateUser,
  // Semester management
  listSemesters,
  createSemester,
  deleteSemester,
  // Department management
  listDepartments,
  createDepartment,
  deleteDepartment,
  // Course management
  listCourses,
  renderCourseForm,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/adminController');

const router = express.Router();

// 모든 라우트는 ADMIN 역할 필요
router.use(requireRole(['ADMIN']));

//--- User Management ---//
// GET /admin/users - 사용자 목록
router.get('/users', /* #swagger.tags = ['Admin']
    #swagger.summary = '모든 사용자 목록 조회'
    #swagger.description = '시스템의 모든 사용자 목록을 조회합니다. (관리자 전용)'
    #swagger.responses[200] = { description: '사용자 목록 조회 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ listUsers);

// GET /admin/users/:id - 사용자 상세
router.get('/users/:id', /* #swagger.tags = ['Admin']
    #swagger.summary = '특정 사용자 상세 정보 조회'
    #swagger.description = '특정 사용자의 상세 정보를 조회합니다. (관리자 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '사용자 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '사용자 정보 조회 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '사용자를 찾을 수 없음' }
*/ getUserDetails);

// POST /admin/users/:id - 사용자 정보 업데이트
router.post('/users/:id', /* #swagger.tags = ['Admin']
    #swagger.summary = '특정 사용자 정보 업데이트'
    #swagger.description = '특정 사용자의 정보를 업데이트합니다. (관리자 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '사용자 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '업데이트할 사용자 정보', required: true, schema: { name: '홍길동', email: 'user@example.com', role: 'STUDENT' } }
    #swagger.responses[200] = { description: '사용자 정보 업데이트 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '사용자를 찾을 수 없음' }
*/ updateUser);

//--- Semester Management ---//
router.get('/semesters', /* #swagger.tags = ['Admin']
    #swagger.summary = '학기 목록 조회'
    #swagger.description = '모든 학기 목록을 조회합니다. (관리자 전용)'
    #swagger.responses[200] = { description: '학기 목록 조회 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ listSemesters);

router.post('/semesters', /* #swagger.tags = ['Admin']
    #swagger.summary = '새 학기 생성'
    #swagger.description = '새로운 학기를 생성합니다. (관리자 전용)'
    #swagger.parameters['body'] = { in: 'body', description: '생성할 학기 정보', required: true, schema: { name: '2025년 1학기', start_date: '2025-03-01', end_date: '2025-06-30' } }
    #swagger.responses[201] = { description: '학기 생성 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ createSemester);

router.post('/semesters/:id/delete', /* #swagger.tags = ['Admin']
    #swagger.summary = '학기 삭제'
    #swagger.description = '특정 학기를 삭제합니다. (관리자 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '학기 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '학기 삭제 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '학기를 찾을 수 없음' }
*/ deleteSemester);

//--- Department Management ---//
router.get('/departments', /* #swagger.tags = ['Admin']
    #swagger.summary = '학과 목록 조회'
    #swagger.description = '모든 학과 목록을 조회합니다. (관리자 전용)'
    #swagger.responses[200] = { description: '학과 목록 조회 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ listDepartments);

router.post('/departments', /* #swagger.tags = ['Admin']
    #swagger.summary = '새 학과 생성'
    #swagger.description = '새로운 학과를 생성합니다. (관리자 전용)'
    #swagger.parameters['body'] = { in: 'body', description: '생성할 학과 정보', required: true, schema: { name: '컴퓨터공학과' } }
    #swagger.responses[201] = { description: '학과 생성 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ createDepartment);

router.post('/departments/:id/delete', /* #swagger.tags = ['Admin']
    #swagger.summary = '학과 삭제'
    #swagger.description = '특정 학과를 삭제합니다. (관리자 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '학과 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '학과 삭제 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '학과를 찾을 수 없음' }
*/ deleteDepartment);

//--- Course Management ---//
router.get('/courses', /* #swagger.tags = ['Admin']
    #swagger.summary = '강의 목록 조회'
    #swagger.description = '모든 강의 목록을 조회합니다. (관리자 전용)'
    #swagger.responses[200] = { description: '강의 목록 조회 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ listCourses);

router.get('/courses/new', /* #swagger.tags = ['Admin']
    #swagger.summary = '새 강의 생성 페이지 렌더링'
    #swagger.description = '새로운 강의를 생성하는 폼 페이지를 렌더링합니다. (관리자 전용)'
    #swagger.produces = ['text/html']
    #swagger.responses[200] = { description: '페이지 렌더링 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ renderCourseForm);

router.post('/courses', /* #swagger.tags = ['Admin']
    #swagger.summary = '새 강의 생성'
    #swagger.description = '새로운 강의를 생성합니다. (관리자 전용)'
    #swagger.parameters['body'] = { in: 'body', description: '생성할 강의 정보', required: true, schema: { title: '자료구조', code: 'CSE2021', section: '02', instructor_id: 1, semester_id: 1, department_id: 1 } }
    #swagger.responses[201] = { description: '강의 생성 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
*/ createCourse);

router.get('/courses/:id/edit', /* #swagger.tags = ['Admin']
    #swagger.summary = '강의 수정 페이지 렌더링'
    #swagger.description = '특정 강의를 수정하는 폼 페이지를 렌더링합니다. (관리자 전용)'
    #swagger.produces = ['text/html']
    #swagger.parameters['id'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '페이지 렌더링 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '강의를 찾을 수 없음' }
*/ renderCourseForm);

router.post('/courses/:id', /* #swagger.tags = ['Admin']
    #swagger.summary = '특정 강의 정보 업데이트'
    #swagger.description = '특정 강의의 정보를 업데이트합니다. (관리자 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.parameters['body'] = { in: 'body', description: '업데이트할 강의 정보', required: true, schema: { title: '자료구조', code: 'CSE2021', section: '02', instructor_id: 1, semester_id: 1, department_id: 1 } }
    #swagger.responses[200] = { description: '강의 정보 업데이트 성공' }
    #swagger.responses[400] = { description: '잘못된 요청' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '강의를 찾을 수 없음' }
*/ updateCourse);

router.post('/courses/:id/delete', /* #swagger.tags = ['Admin']
    #swagger.summary = '강의 삭제'
    #swagger.description = '특정 강의를 삭제합니다. (관리자 전용)'
    #swagger.parameters['id'] = { in: 'path', description: '강의 ID', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '강의 삭제 성공' }
    #swagger.responses[403] = { description: '권한 없음' }
    #swagger.responses[404] = { description: '강의를 찾을 수 없음' }
*/ deleteCourse);

// GET /admin -> redirect to dashboard
router.get('/', (req, res) => {
  // #swagger.ignore = true
  res.redirect('/me/dashboard');
});


module.exports = router;
