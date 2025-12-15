// controllers/adminController.js
const { User, Semester, Department, Course, AuditLog } = require('../models');

// GET /admin/users - 사용자 목록
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.render('admin/user_list', { title: '사용자 관리', users });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /admin/users/:id - 사용자 상세
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).send('사용자를 찾을 수 없습니다.');
    }
    res.render('admin/user_details', { title: '사용자 정보', userToEdit: user });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /admin/users/:id - 사용자 정보 업데이트
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    await User.update({
      name,
      email,
      role,
    }, {
      where: { id: req.params.id },
    });
    res.redirect(`/admin/users/${req.params.id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /admin/users/:id/delete - 사용자 삭제
exports.deleteUser = async (req, res, next) => {
  try {
    const userIdToDelete = parseInt(req.params.id, 10);
    const adminUserId = req.session.user.id;

    // 관리자가 자기 자신을 삭제하는 것을 방지
    if (userIdToDelete === adminUserId) {
      return res.status(403).send('<script>alert("자기 자신은 삭제할 수 없습니다."); window.location.href="/admin/users";</script>');
    }

    const user = await User.findByPk(userIdToDelete);
    if (user) {
      await user.destroy();
      
      // 감사 로그 기록
      await AuditLog.create({
        actor_id: adminUserId,
        action: 'USER_DELETE',
        target_type: 'User',
        target_id: userIdToDelete,
        meta_json: { deleted_user_email: user.email }
      });
    }
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//--- Semester Management ---//
exports.listSemesters = async (req, res, next) => {
  try {
    const semesters = await Semester.findAll({ order: [['start_date', 'DESC']] });
    res.render('admin/semesters_list', { title: '학기 관리', semesters });
  } catch (error) {
    next(error);
  }
};

exports.createSemester = async (req, res, next) => {
  try {
    const { name, start_date, end_date } = req.body;
    await Semester.create({ name, start_date, end_date });
    res.redirect('/admin/semesters');
  } catch (error) {
    next(error);
  }
};

exports.deleteSemester = async (req, res, next) => {
  try {
    await Semester.destroy({ where: { id: req.params.id } });
    res.redirect('/admin/semesters');
  } catch (error) {
    next(error);
  }
};

//--- Department Management ---//
exports.listDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({ order: [['name', 'ASC']] });
    res.render('admin/departments_list', { title: '학과 관리', departments });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;
    await Department.create({ name });
    res.redirect('/admin/departments');
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    await Department.destroy({ where: { id: req.params.id } });
    res.redirect('/admin/departments');
  } catch (error) {
    next(error);
  }
};

//--- Course Management ---//
exports.listCourses = async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      include: ['Instructor', 'Semester', 'Department'],
      order: [['createdAt', 'DESC']],
    });
    res.render('admin/courses_list', { title: '과목 관리', courses });
  } catch (error) {
    next(error);
  }
};

exports.renderCourseForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    let course = null;
    if (id) {
      course = await Course.findByPk(id);
    }
    const instructors = await User.findAll({ where: { role: 'INSTRUCTOR' } });
    const semesters = await Semester.findAll();
    const departments = await Department.findAll();
    res.render('admin/course_form', {
      title: id ? '과목 수정' : '과목 생성',
      course,
      instructors,
      semesters,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    await Course.create(req.body);
    res.redirect('/admin/courses');
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    await Course.update(req.body, { where: { id: req.params.id } });
    res.redirect('/admin/courses');
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    await Course.destroy({ where: { id: req.params.id } });
    res.redirect('/admin/courses');
  } catch (error) {
    next(error);
  }
};
