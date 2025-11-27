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
router.get('/', isLoggedIn, getReceivedMessages);

// GET /messages/new - 새 메시지 작성 폼
router.get('/new', isLoggedIn, renderNewMessageForm);

// POST /messages - 메시지 생성/전송
router.post('/', isLoggedIn, createMessage);

// GET /messages/:id - 메시지 상세 보기
router.get('/:id', isLoggedIn, getMessageDetails);


module.exports = router;
