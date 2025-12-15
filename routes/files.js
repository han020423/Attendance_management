// routes/files.js
const express = require('express');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const { downloadFile } = require('../controllers/fileController');

const router = express.Router();

// GET /files/:id - 파일 다운로드
router.get('/:id', isLoggedIn, /* #swagger.tags = ['Files']
    #swagger.summary = '파일 다운로드'
    #swagger.description = 'ID에 해당하는 파일을 다운로드합니다. (예: 공결 증빙 파일)'
    #swagger.parameters['id'] = { in: 'path', description: '파일 ID', required: true, type: 'integer' }
    #swagger.produces = ['application/octet-stream']
    #swagger.responses[200] = { description: '파일 다운로드 성공' }
    #swagger.responses[401] = { description: '로그인 필요' }
    #swagger.responses[403] = { description: '파일 접근 권한 없음' }
    #swagger.responses[404] = { description: '파일을 찾을 수 없음' }
*/ downloadFile);

module.exports = router;
