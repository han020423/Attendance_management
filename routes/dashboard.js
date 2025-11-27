// routes/dashboard.js
const express = require('express');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const { getDashboard } = require('../controllers/dashboardController');

const router = express.Router();

// GET /me/dashboard - 역할별 대시보드
router.get('/', isLoggedIn, getDashboard);

module.exports = router;
