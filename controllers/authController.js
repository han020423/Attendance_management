// controllers/authController.js
const bcrypt = require('bcrypt');
const { User, AuditLog } = require('../models');

// GET /auth/login
exports.renderLogin = (req, res) => {
  res.render('auth/login', { title: '로그인' });
};

// POST /auth/login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      const result = await bcrypt.compare(password, user.password_hash);
      if (result) {
        req.session.user = {
          id: user.id,
          name: user.name,
          role: user.role,
        };
        // 감사 로그 기록
        await AuditLog.create({
          actor_id: user.id,
          action: 'USER_LOGIN',
          target_type: 'User',
          target_id: user.id,
        });
        return res.redirect('/me/dashboard');
      }
    }
    // 로그인 실패
    return res.status(400).render('auth/login', {
      title: '로그인',
      error: '이메일 또는 비밀번호가 올바르지 않습니다.',
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// POST /auth/logout
exports.logout = async (req, res, next) => {
  try {
    // 감사 로그 기록
    if (req.session.user) {
      await AuditLog.create({
        actor_id: req.session.user.id,
        action: 'USER_LOGOUT',
        target_type: 'User',
        target_id: req.session.user.id,
      });
    }
    req.session.destroy(() => {
      res.redirect('/');
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /auth/register
exports.renderRegister = (req, res) => {
  res.render('auth/register', { title: '회원가입' });
};

// POST /auth/register
exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  try {
    // 백엔드 보안: role이 'ADMIN'인 경우 가입 차단
    if (role && role.toUpperCase() === 'ADMIN') {
      return res.status(403).render('auth/register', {
        title: '회원가입',
        error: '관리자(ADMIN) 역할로는 가입할 수 없습니다.',
      });
    }

    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.status(409).render('auth/register', { // 409 Conflict
        title: '회원가입',
        error: '이미 가입된 이메일입니다.',
      });
    }
    const hash = await bcrypt.hash(password, 12);
    // role이 없거나 'ADMIN'이 아니면 기본값 'STUDENT' 또는 해당 역할로 설정
    const userRole = (role && role.toUpperCase() !== 'ADMIN') ? role : 'STUDENT';
    const user = await User.create({
      name,
      email,
      password_hash: hash,
      role: userRole,
    });
    // 감사 로그 기록
    await AuditLog.create({
      actor_id: user.id,
      action: 'USER_REGISTER',
      target_type: 'User',
      target_id: user.id,
    });
    return res.redirect('/auth/login');
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
