const db = require('../models');

async function resetUsers() {
  try {
    // Delete all users
    await db.User.destroy({ where: {}, truncate: true });
    console.log('All users deleted successfully.');

    // Create a new admin user
    const email = 'admin@teraplus.com';
    const namaLengkap = 'Admin Teraplus';
    const password = 'AdminPass123';

    await db.User.create({
      namaLengkap,
      email,
      password,
      role: 'admin',
    });

    console.log('New admin user created successfully.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('Error resetting users:', error);
    process.exit(1);
  }
}

resetUsers();
