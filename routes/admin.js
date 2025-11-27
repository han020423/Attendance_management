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
router.get('/users', listUsers);
// GET /admin/users/:id - 사용자 상세
router.get('/users/:id', getUserDetails);
// POST /admin/users/:id - 사용자 정보 업데이트
router.post('/users/:id', updateUser);

//--- Semester Management ---//
router.get('/semesters', listSemesters);
router.post('/semesters', createSemester);
router.post('/semesters/:id/delete', deleteSemester);

//--- Department Management ---//
router.get('/departments', listDepartments);
router.post('/departments', createDepartment);
router.post('/departments/:id/delete', deleteDepartment);

//--- Course Management ---//
router.get('/courses', listCourses);
router.get('/courses/new', renderCourseForm);
router.post('/courses', createCourse);
router.get('/courses/:id/edit', renderCourseForm);
router.post('/courses/:id', updateCourse);
router.post('/courses/:id/delete', deleteCourse);


module.exports = router;
