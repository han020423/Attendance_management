// controllers/courseController.js
const { Course, ClassSession, Enrollment, User, Semester, CoursePolicy, Attendance, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /courses - 자신의 강의 목록
exports.getMyCourses = async (req, res, next) => {
  try {
    const { id, role } = req.session.user;
    let courses;
    if (role === 'INSTRUCTOR') {
      courses = await Course.findAll({
        where: { instructor_id: id },
        include: [Semester]
      });
    } else { // STUDENT
      const enrollments = await Enrollment.findAll({
        where: { user_id: id },
        include: [{
          model: Course,
          include: [Semester, { model: User, as: 'Instructor', attributes: ['name'] }]
        }]
      });
      courses = enrollments.map(e => e.Course);
    }
    res.render('courses/list', { title: '내 강의 목록', courses });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /courses/new - 강의 생성 폼 렌더링
exports.renderCreateCourseForm = async (req, res, next) => {
  try {
    const semesters = await Semester.findAll({ order: [['name', 'DESC']] });
    res.render('courses/form', { title: '강의 생성', semesters });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /courses - 강의 생성
exports.createCourse = async (req, res, next) => {
  try {
    const { title, code, section, department, semester_id } = req.body;
    const instructor_id = req.session.user.id;
    const course = await Course.create({
      title,
      code,
      section,
      department,
      semester_id,
      instructor_id,
    });
    // 기본 정책 생성
    await CoursePolicy.create({ course_id: course.id });
    res.redirect(`/courses/${course.id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};


// GET /courses/:id - 강의 상세 정보
exports.getCourseDetails = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Instructor', attributes: ['name'] },
        Semester,
        { model: ClassSession, order: [['week', 'ASC']] }
      ]
    });
    if (!course) {
      return res.status(404).send('강의를 찾을 수 없습니다.');
    }
    res.render('courses/details', { title: course.title, course });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /courses/:id/sessions - 수업 일정 일괄 생성
exports.createSessions = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const { startDate, weeks, dayOfWeek, startTime, endTime } = req.body;

    const sessions = [];
    let current = new Date(startDate);
    // 시작 날짜를 지정된 요일로 맞춤
    current.setDate(current.getDate() + (dayOfWeek - current.getDay() + 7) % 7);

    for (let i = 0; i < weeks; i++) {
      const sessionDate = new Date(current);
      sessionDate.setDate(sessionDate.getDate() + (i * 7));

      sessions.push({
        course_id: courseId,
        week: i + 1,
        date: sessionDate.toISOString().split('T')[0],
        start_at: startTime,
        end_at: endTime,
      });
    }

    await ClassSession.bulkCreate(sessions);
    res.redirect(`/courses/${courseId}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /courses/:id/policy - 정책 관리 페이지
exports.renderPolicyForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id);
        const policy = await CoursePolicy.findOne({ where: { course_id: id } });
        if (!policy) {
            // 정책이 없으면 기본값으로 생성
            const newPolicy = await CoursePolicy.create({ course_id: id });
            return res.render('courses/policy', { title: '출석 정책 관리', course, policy: newPolicy });
        }
        res.render('courses/policy', { title: '출석 정책 관리', course, policy });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// POST /courses/:id/policy - 정책 업데이트
exports.updatePolicy = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { late_penalty_points, absence_penalty_points, lates_for_absence } = req.body;
        await CoursePolicy.update({
            late_penalty_points,
            absence_penalty_points,
            lates_for_absence,
        }, {
            where: { course_id: id }
        });
        res.redirect(`/courses/${id}/policy`);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// GET /courses/:id/score - 내 출석 점수 보기
exports.getAttendanceScore = async (req, res, next) => {
    try {
        const { id: course_id } = req.params;
        const student_id = req.session.user.id;

        const policy = await CoursePolicy.findOne({ where: { course_id } });
        const course = await Course.findByPk(course_id);

        const attendances = await Attendance.findAll({
            where: { student_id },
            include: [{
                model: ClassSession,
                where: { course_id },
                attributes: [],
            }]
        });

        let lateCount = 0;
        let absentCount = 0;
        attendances.forEach(att => {
            if (att.status === 2) lateCount++; // 지각
            if (att.status === 3) absentCount++; // 결석
        });

        // 지각 횟수를 결석 횟수로 변환
        const latesForAbsence = policy.lates_for_absence || 2;
        absentCount += Math.floor(lateCount / latesForAbsence);
        const remainingLates = lateCount % latesForAbsence;

        const totalPenalty = (absentCount * policy.absence_penalty_points) + (remainingLates * policy.late_penalty_points);
        
        // 총점 계산 (예: 20점 만점)
        const maxScore = 20;
        const finalScore = Math.max(0, maxScore - totalPenalty);

        res.render('courses/score', {
            title: '내 출석 점수',
            course,
            lateCount,
            absentCount,
            totalPenalty,
            finalScore,
            maxScore,
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};

// GET /courses/:id/enrollments - 수강생 관리 페이지
exports.renderEnrollmentPage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id);
        const enrollments = await Enrollment.findAll({
            where: { course_id: id },
            include: [{ model: User, attributes: ['id', 'name', 'email'] }],
            order: [[User, 'name', 'ASC']],
        });
        res.render('courses/enrollments', {
            title: '수강생 관리',
            course,
            enrollments,
            error: req.query.error,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// POST /courses/:id/enrollments - 학생 추가
exports.addStudentToCourse = async (req, res, next) => {
    const { id: course_id } = req.params;
    const { student_email } = req.body;
    try {
        const user = await User.findOne({ where: { email: student_email, role: 'STUDENT' } });
        if (!user) {
            return res.redirect(`/courses/${course_id}/enrollments?error=Student not found`);
        }

        const [enrollment, created] = await Enrollment.findOrCreate({
            where: {
                user_id: user.id,
                course_id: course_id,
            },
            defaults: { role: 'STUDENT' }
        });

        if (!created) {
            return res.redirect(`/courses/${course_id}/enrollments?error=Student already enrolled`);
        }

        res.redirect(`/courses/${course_id}/enrollments`);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// POST /courses/:courseId/enrollments/:enrollmentId/delete - 학생 삭제
exports.removeStudentFromCourse = async (req, res, next) => {
    try {
        const { courseId, enrollmentId } = req.params;
        await Enrollment.destroy({
            where: { id: enrollmentId }
        });
        res.redirect(`/courses/${courseId}/enrollments`);
    } catch (error) {
        console.error(error);
        next(error);
    }
};