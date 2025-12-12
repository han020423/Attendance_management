// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');

dotenv.config(); // .env 파일 로드

const { sequelize } = require('./models'); // Sequelize 인스턴스

// 라우터 임포트
const authRouter = require('./routes/auth');
const courseRouter = require('./routes/courses');
const sessionRouter = require('./routes/sessions');
const excuseRouter = require('./routes/excuses');
const appealRouter = require('./routes/appeals');
const reportRouter = require('./routes/reports');
const fileRouter = require('./routes/files');
const auditRouter = require('./routes/audits');
const dashboardRouter = require('./routes/dashboard');
const notificationRouter = require('./routes/notifications');
const voteRouter = require('./routes/votes');
const messageRouter = require('./routes/messages');
const adminRouter = require('./routes/admin');
const adminReportsRouter = require('./routes/adminReports');
const sseRouter = require('./routes/sse'); // SSE 라우터 추가


const app = express();

// SSE 클라이언트 관리용 Map
const sseClients = new Map();
app.set('sseClients', sseClients);

// SSE 알림 발송 헬퍼 함수
app.set('sendSseNotification', (userId, notification) => {
  // userId를 문자열로 변환하여 클라이언트를 조회합니다.
  const client = sseClients.get(String(userId));
  if (client) {
    client.write(`data: ${JSON.stringify(notification)}

`);
  }
});


// Sequelize 연결
sequelize.sync({ alter: true }) // alter: true로 하면 모델 변경 시 DB에 반영
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

// 뷰 엔진 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 미들웨어 설정
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 업로드 폴더 정적 제공
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 요청 본문 파싱
app.use(methodOverride('_method')); // _method 쿼리 파라미터를 통해 HTTP 메소드 오버라이드

// 세션 설정
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET, // .env 파일에 저장된 시크릿 키
  cookie: {
    httpOnly: true,
    secure: false, // https 적용 시 true로 변경
  },
}));

// 모든 뷰에서 로그인 정보를 사용할 수 있도록 res.locals에 저장
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// 기본 경로
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/me/dashboard');
  } else {
    res.redirect('/auth/login');
  }
});


// 라우터 연결
app.use('/auth', authRouter);
app.use('/courses', courseRouter);
app.use('/sessions', sessionRouter);
app.use('/excuses', excuseRouter);
app.use('/appeals', appealRouter);
app.use('/reports', reportRouter);
app.use('/files', fileRouter);
app.use('/audits', auditRouter);
app.use('/me/dashboard', dashboardRouter);
app.use('/me/notifications', notificationRouter);
app.use('/votes', voteRouter);
app.use('/messages', messageRouter);
app.use('/admin', adminRouter);
app.use('/admin/reports', adminReportsRouter);
app.use('/sse', sseRouter); // SSE 라우터 연결


// 404 처리 미들웨어
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error'); // error.ejs 뷰 렌더링
});

app.listen(3000, () => {
  console.log('3000번 포트에서 서버 대기 중');
});
