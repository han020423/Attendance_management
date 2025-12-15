'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('attendances', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      first: true // 이 컬럼을 테이블의 첫 번째 위치에 추가
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('attendances', 'id');
  }
};
