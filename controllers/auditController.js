// controllers/auditController.js
const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

// GET /audits - 감사 로그 조회
exports.getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20; // 한 페이지에 20개씩 표시
    const offset = (page - 1) * limit;

    const { target_type, target_id, actor_id } = req.query;
    const where = {};
    if (target_type) where.target_type = target_type;
    if (target_id) where.target_id = target_id;
    if (actor_id) where.actor_id = actor_id;

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'Actor', attributes: ['name', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.render('audits/list', {
      title: '감사 로그',
      logs,
      filters: req.query,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
