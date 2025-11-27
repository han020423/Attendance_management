// controllers/fileController.js
const { ExcuseFile, ExcuseRequest, ClassSession, Course } = require('../models');

// GET /files/:id - 파일 다운로드
exports.downloadFile = async (req, res, next) => {
  try {
    const file = await ExcuseFile.findByPk(req.params.id, {
      include: [{
        model: ExcuseRequest,
        attributes: ['student_id'],
        include: [{
          model: ClassSession,
          attributes: ['course_id'],
          include: [{
            model: Course,
            attributes: ['instructor_id']
          }]
        }]
      }]
    });

    if (!file) {
      return res.status(404).send('파일을 찾을 수 없습니다.');
    }

    // 권한 체크: 관리자, 파일 올린 학생, 해당 과목 교수만 다운로드 가능
    const user = req.session.user;
    const studentId = file.ExcuseRequest.student_id;
    const instructorId = file.ExcuseRequest.ClassSession.Course.instructor_id;

    if (user.role === 'ADMIN' || user.id === studentId || user.id === instructorId) {
      res.download(file.file_path, file.original_name);
    } else {
      return res.status(403).send('다운로드 권한이 없습니다.');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
