'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Helper function to remove the old constraint and add a new one with onDelete policy
      const updateConstraint = async (tableName, fieldName, targetTable, onDelete, constraintName) => {
        try {
          await queryInterface.removeConstraint(tableName, constraintName, { transaction });
        } catch (e) {
          console.error(`Could not remove constraint ${constraintName} from ${tableName}. It might not exist, proceeding to add. Error: ${e.message}`);
        }
        await queryInterface.addConstraint(tableName, {
          fields: [fieldName],
          type: 'foreign key',
          name: constraintName,
          references: {
            table: targetTable,
            field: 'id',
          },
          onDelete: onDelete,
          onUpdate: 'CASCADE',
        }, { transaction });
      };

      // Applying constraints based on our model changes
      await updateConstraint('enrollments', 'user_id', 'users', 'CASCADE', 'enrollments_user_id_fkey');
      await updateConstraint('enrollments', 'course_id', 'courses', 'CASCADE', 'enrollments_course_id_fkey');

      await updateConstraint('attendances', 'session_id', 'class_sessions', 'CASCADE', 'attendances_session_id_fkey');
      await updateConstraint('attendances', 'student_id', 'users', 'CASCADE', 'attendances_student_id_fkey');
      await updateConstraint('attendances', 'updated_by', 'users', 'SET NULL', 'attendances_updated_by_fkey');

      await updateConstraint('attendance_appeals', 'attendance_id', 'attendances', 'CASCADE', 'attendance_appeals_attendance_id_fkey');
      await updateConstraint('attendance_appeals', 'student_id', 'users', 'CASCADE', 'attendance_appeals_student_id_fkey');
      await updateConstraint('attendance_appeals', 'reviewed_by', 'users', 'SET NULL', 'attendance_appeals_reviewed_by_fkey');

      await updateConstraint('course_policies', 'course_id', 'courses', 'CASCADE', 'course_policies_course_id_fkey');

      await updateConstraint('excuse_files', 'excuse_id', 'excuse_requests', 'CASCADE', 'excuse_files_excuse_id_fkey');

      await updateConstraint('messages', 'from_user_id', 'users', 'CASCADE', 'messages_from_user_id_fkey');
      await updateConstraint('messages', 'to_user_id', 'users', 'CASCADE', 'messages_to_user_id_fkey');
      await updateConstraint('messages', 'course_id', 'courses', 'CASCADE', 'messages_course_id_fkey');

      await updateConstraint('votes', 'course_id', 'courses', 'CASCADE', 'votes_course_id_fkey');
      await updateConstraint('votes', 'target_session_id', 'class_sessions', 'CASCADE', 'votes_target_session_id_fkey');

      await updateConstraint('courses', 'instructor_id', 'users', 'SET NULL', 'courses_instructor_id_fkey');
      await updateConstraint('courses', 'semester_id', 'semesters', 'SET NULL', 'courses_semester_id_fkey');
      await updateConstraint('courses', 'department_id', 'departments', 'SET NULL', 'courses_department_id_fkey');

      await updateConstraint('excuse_requests', 'session_id', 'class_sessions', 'CASCADE', 'excuse_requests_session_id_fkey');
      await updateConstraint('excuse_requests', 'student_id', 'users', 'CASCADE', 'excuse_requests_student_id_fkey');
      await updateConstraint('excuse_requests', 'reviewed_by', 'users', 'SET NULL', 'excuse_requests_reviewed_by_fkey');

      await updateConstraint('class_sessions', 'course_id', 'courses', 'CASCADE', 'class_sessions_course_id_fkey');

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Helper function to revert constraints to their original state (without onDelete)
      const revertConstraint = async (tableName, fieldName, targetTable, constraintName) => {
        try {
          await queryInterface.removeConstraint(tableName, constraintName, { transaction });
        } catch (e) {
          console.error(`Could not remove constraint ${constraintName} from ${tableName}. It might not exist, proceeding to add. Error: ${e.message}`);
        }
        await queryInterface.addConstraint(tableName, {
          fields: [fieldName],
          type: 'foreign key',
          name: constraintName,
          references: {
            table: targetTable,
            field: 'id',
          },
          onDelete: 'NO ACTION', // Reverting to default
          onUpdate: 'CASCADE',
        }, { transaction });
      };

      // Reverting all constraints
      await revertConstraint('enrollments', 'user_id', 'users', 'enrollments_user_id_fkey');
      await revertConstraint('enrollments', 'course_id', 'courses', 'enrollments_course_id_fkey');

      await revertConstraint('attendances', 'session_id', 'class_sessions', 'attendances_session_id_fkey');
      await revertConstraint('attendances', 'student_id', 'users', 'attendances_student_id_fkey');
      await revertConstraint('attendances', 'updated_by', 'users', 'attendances_updated_by_fkey');

      await revertConstraint('attendance_appeals', 'attendance_id', 'attendances', 'attendance_appeals_attendance_id_fkey');
      await revertConstraint('attendance_appeals', 'student_id', 'users', 'attendance_appeals_student_id_fkey');
      await revertConstraint('attendance_appeals', 'reviewed_by', 'users', 'attendance_appeals_reviewed_by_fkey');

      await revertConstraint('course_policies', 'course_id', 'courses', 'course_policies_course_id_fkey');

      await revertConstraint('excuse_files', 'excuse_id', 'excuse_requests', 'excuse_files_excuse_id_fkey');

      await revertConstraint('messages', 'from_user_id', 'users', 'messages_from_user_id_fkey');
      await revertConstraint('messages', 'to_user_id', 'users', 'messages_to_user_id_fkey');
      await revertConstraint('messages', 'course_id', 'courses', 'messages_course_id_fkey');

      await revertConstraint('votes', 'course_id', 'courses', 'votes_course_id_fkey');
      await revertConstraint('votes', 'target_session_id', 'class_sessions', 'votes_target_session_id_fkey');

      await revertConstraint('courses', 'instructor_id', 'users', 'courses_instructor_id_fkey');
      await revertConstraint('courses', 'semester_id', 'semesters', 'courses_semester_id_fkey');
      await revertConstraint('courses', 'department_id', 'departments', 'courses_department_id_fkey');

      await revertConstraint('excuse_requests', 'session_id', 'class_sessions', 'excuse_requests_session_id_fkey');
      await revertConstraint('excuse_requests', 'student_id', 'users', 'excuse_requests_student_id_fkey');
      await revertConstraint('excuse_requests', 'reviewed_by', 'users', 'excuse_requests_reviewed_by_fkey');

      await revertConstraint('class_sessions', 'course_id', 'courses', 'class_sessions_course_id_fkey');

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};