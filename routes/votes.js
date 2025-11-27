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
router.get('/course/:courseId', requireRole(['INSTRUCTOR', 'STUDENT']), getCourseVotes);

// GET /votes/new/course/:courseId - 투표 생성 폼
router.get('/new/course/:courseId', requireRole(['INSTRUCTOR']), renderVoteForm);

// POST /votes/course/:courseId - 투표 생성
router.post('/course/:courseId', requireRole(['INSTRUCTOR']), createVote);

// GET /votes/:id - 투표 상세 및 참여
router.get('/:id', requireRole(['INSTRUCTOR', 'STUDENT']), getVote);

// POST /votes/:id/respond - 투표 제출
router.post('/:id/respond', requireRole(['STUDENT']), submitVote);

module.exports = router;
