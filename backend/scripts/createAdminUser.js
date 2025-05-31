const { Sequelize } = require('sequelize');
const db = require('../models');

async function createAdmin() {
  try {
    const email = 'admin2@teraplus.com';
    const namaLengkap = 'Admin Teraplus Two';
    const password = 'AdminPass456'; // You can change this password

    // Check if admin user already exists
    const existingAdmin = await db.User.findOne({ where: { email } });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    // Create admin user without manual hashing, model will hash password
    await db.User.create({
      namaLengkap,
      email,
      password,
      role: 'admin',
    });

    console.log('Admin user created successfully.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
