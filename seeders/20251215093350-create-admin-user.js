'use strict';
const bcrypt = require('bcrypt');
require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const password = process.env.ADMIN_SEED_PASSWORD || '1234';
    const hash = await bcrypt.hash(password, 12);

    await queryInterface.bulkInsert('users', [{
      role: 'ADMIN',
      name: '관리자',
      email: 'admin@sangmyung.kr',
      password_hash: hash,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@sangmyung.kr' }, {});
  }
};
