// middlewares/authMiddleware.js

// 로그인 여부 확인
exports.isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next(); // 로그인 되어있으면 다음 미들웨어로
  } else {
    // AJAX 요청인 경우 JSON 응답, 아닌 경우 리다이렉트
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
    } else {
      res.redirect('/auth/login');
    }
  }
};

// 로그인 안 한 경우 확인
exports.isNotLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.');
    res.redirect(`/?error=${message}`); // 로그인 되어있으면 메인으로
  }
};

// 특정 역할(role)을 가졌는지 확인하는 미들웨어
// roles는 배열 형태로 ['ADMIN', 'INSTRUCTOR'] 와 같이 받을 수 있음
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (req.session.user && roles.includes(req.session.user.role)) {
      next();
    } else {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        res.status(403).json({ message: '접근 권한이 없습니다.' });
      } else {
        const error = new Error('접근 권한이 없습니다.');
        error.status = 403;
        next(error);
      }
    }
  };
};
