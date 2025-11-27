// controllers/auditController.js
const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

// GET /audits - 감사 로그 조회
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { target_type, target_id, actor_id } = req.query;
    const where = {};
    if (target_type) where.target_type = target_type;
    if (target_id) where.target_id = target_id;
    if (actor_id) where.actor_id = actor_id;

    const logs = await AuditLog.findAll({
      where,
      include: [{ model: User, as: 'Actor', attributes: ['name', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit: 100, // 최근 100개만 조회
    });

    res.render('audits/list', {
      title: '감사 로그',
      logs,
      filters: req.query,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
