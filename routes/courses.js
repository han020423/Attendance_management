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
router.get('/', isLoggedIn, getMyCourses);

// GET /courses/:id - 특정 강의 상세 정보
router.get('/:id', isLoggedIn, getCourseDetails);

// POST /courses/:id/sessions - 수업 일정 일괄 생성
router.post('/:id/sessions', requireRole(['INSTRUCTOR']), createSessions);

// GET /courses/:id/policy - 정책 관리 페이지
router.get('/:id/policy', requireRole(['INSTRUCTOR']), renderPolicyForm);

// POST /courses/:id/policy - 정책 업데이트
router.post('/:id/policy', requireRole(['INSTRUCTOR']), updatePolicy);

// GET /courses/:id/score - 내 출석 점수 보기
router.get('/:id/score', requireRole(['STUDENT']), getAttendanceScore);

// GET /courses/:id/enrollments - 수강생 관리 페이지
router.get('/:id/enrollments', requireRole(['INSTRUCTOR']), renderEnrollmentPage);

// POST /courses/:id/enrollments - 학생 추가
router.post('/:id/enrollments', requireRole(['INSTRUCTOR']), addStudentToCourse);

// POST /courses/:courseId/enrollments/:enrollmentId/delete - 학생 삭제
router.post('/:courseId/enrollments/:enrollmentId/delete', requireRole(['INSTRUCTOR']), removeStudentFromCourse);


module.exports = router;
