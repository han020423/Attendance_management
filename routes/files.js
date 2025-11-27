// routes/files.js
const express = require('express');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const { downloadFile } = require('../controllers/fileController');

const router = express.Router();

// GET /files/:id - 파일 다운로드
router.get('/:id', isLoggedIn, downloadFile);

module.exports = router;
