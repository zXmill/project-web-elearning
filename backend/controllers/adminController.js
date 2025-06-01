// Placeholder for admin-specific controller actions
const { User, Course } = require('../models'); // Import User and Course models
const bcrypt = require('bcryptjs'); // For hashing password if updated

exports.getDashboardSummary = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalCourses = await Course.count();
    // Count all enrollments (active means enrolled)
    const Enrollment = require('../models').Enrollment;
    const activeEnrollments = await Enrollment.count();

    const summary = {
      totalUsers,
      totalCourses,
      activeEnrollments 
    };
    res.status(200).json({
      status: 'success',
      data: {
        summary
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil ringkasan dashboard.'
    });
  }
};

// Placeholder for Get All Users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      attributes: { exclude: ['password', 'googleId', 'passwordResetToken', 'passwordResetExpires'] },
      order: [['id', 'ASC']] // Optional: order by ID or another field
    });
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data pengguna.'
    });
  }
};

// Controller to create a new user (by admin)
exports.createUser = async (req, res) => {
  const { namaLengkap, email, password, role } = req.body;

  // Basic validation
  if (!namaLengkap || !email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Nama lengkap, email, dan password diperlukan.'
    });
  }

  // Validate role if provided, otherwise it defaults to 'user' via model
  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Role tidak valid. Harus "user" atau "admin".'
    });
  }

  try {
    console.log('[CreateUser] Attempting to create user with email:', email); // Log entry
    // Check if user already exists
    console.log('[CreateUser] Checking for existing user...');
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('[CreateUser] User with this email already exists:', email);
      return res.status(409).json({ // 409 Conflict
        status: 'fail',
        message: 'Email sudah terdaftar.'
      });
    }

    // Create new user
    console.log('[CreateUser] No existing user found. Proceeding to create new user...');
    const newUser = await User.create({
      namaLengkap,
      email,
      password,
      role: role || 'user' // Default to 'user' if role is not provided
    });
    console.log('[CreateUser] New user created successfully in DB:', newUser.id);

    // Exclude password from the response
    const userResponse = { ...newUser.toJSON() };
    delete userResponse.password;
    delete userResponse.googleId;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;


    res.status(201).json({
      status: 'success',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat pengguna baru.'
    });
  }
};

// Controller to update a user (by admin)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { namaLengkap, email, password, role } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pengguna tidak ditemukan.'
      });
    }

    // Update fields if provided
    if (namaLengkap) user.namaLengkap = namaLengkap;
    if (email) {
      // Check if new email already exists for another user
      if (email !== user.email) {
        const existingUserWithNewEmail = await User.findOne({ where: { email } });
        if (existingUserWithNewEmail && existingUserWithNewEmail.id !== parseInt(id)) {
          return res.status(409).json({
            status: 'fail',
            message: 'Email baru sudah digunakan oleh pengguna lain.'
          });
        }
      }
      user.email = email;
    }
    if (role) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Role tidak valid. Harus "user" atau "admin".'
        });
      }
      user.role = role;
    }

    // Update password if provided and not empty
    if (password && password.trim() !== '') {
      user.password = password; // The model's hook will hash it
    }

    await user.save();

    // Exclude sensitive fields from the response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;
    delete userResponse.googleId;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;

    res.status(200).json({
      status: 'success',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui pengguna.'
    });
  }
};

// Controller to delete a user (by admin)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  console.log(`[AdminController] Attempting to delete user with ID: ${id}`);

  try {
    const user = await User.findByPk(id);

    if (!user) {
      console.log(`[AdminController] User with ID: ${id} not found for deletion.`);
      return res.status(404).json({
        status: 'fail',
        message: 'Pengguna tidak ditemukan.'
      });
    }

    // Optional: Add checks here if certain users (e.g., a primary superadmin) cannot be deleted.
    // For example, if (user.email === 'superadmin@example.com') return res.status(403).json(...);

    console.log(`[AdminController] Found user ${user.email} (ID: ${id}), attempting to destroy...`);
    await user.destroy();
    console.log(`[AdminController] User ID: ${id} destroyed successfully.`);
    
    // A 204 No Content response should not have a body.
    res.status(204).send();

  } catch (error) {
    console.error(`[AdminController] Error during deletion of user ID: ${id}.`);
    console.error('[AdminController] Error Name:', error.name);
    console.error('[AdminController] Error Message:', error.message);
    // Avoid logging full stack in production for brevity here, but good for dev
    // console.error('[AdminController] Error Stack:', error.stack); 
    
    // Attempt to stringify the error for more details if it's a complex object
    let detailedError = error.message;
    if (typeof error === 'object' && error !== null) {
        try {
            detailedError = JSON.stringify(error, Object.getOwnPropertyNames(error));
        } catch (e) {
            // Fallback if stringify fails (e.g. circular structures)
            detailedError = error.toString();
        }
    }
    console.error('[AdminController] Full Error Details (attempted stringify):', detailedError);


    res.status(500).json({
      status: 'error',
      message: `Server failed to delete user ${id}. Please check server logs.`,
      errorCode: 'ADMIN_DELETE_USER_FAILED',
      // Optionally include a sanitized version of the error if safe
      // errorDetail: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// --- ADMIN: Get all courses (for admin panel) ---
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      order: [['judul', 'ASC']],
    });
    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: { courses },
    });
  } catch (error) {
    console.error('[AdminController] Error fetching courses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data kursus (admin).',
    });
  }
};

// Get all courses (admin)
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.findAll({
      order: [['judul', 'ASC']],
    });
    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: { courses },
    });
  } catch (error) {
    console.error('Error fetching courses (admin):', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data kursus (admin).',
    });
  }
};
