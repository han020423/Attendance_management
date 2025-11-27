// middlewares/fileUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 업로드 디렉토리가 없으면 생성
try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads/'); // 파일을 uploads 폴더에 저장
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname); // 확장자
      const basename = path.basename(file.originalname, ext); // 파일 이름
      // 파일명 중복을 피하기 위해 현재 시간(밀리초)을 추가
      done(null, basename + '_' + new Date().getTime() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB로 파일 크기 제한
});

module.exports = upload;
