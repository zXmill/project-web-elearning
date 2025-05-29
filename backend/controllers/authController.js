const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Generate JWT Token
const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Google OAuth
exports.googleLogin = async (req, res) => {
  try {
    const token = signToken(req.user.id, req.user.role);
    
    // Redirect ke frontend dengan token
    res.redirect(`${process.env.FRONTEND_URL}/auth-redirect?token=${token}`);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat login dengan Google'
    });
  }
};

// Local Login
exports.localLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cek email dan password ada
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email dan password harus diisi'
      });
    }

    // 2. Cek user exist & password benar
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email atau password salah'
      });
    }

    // 3. Generate token
    const token = signToken(user.id, user.role);

    // 4. Kirim response
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.namaLengkap,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Protect Route Contoh
exports.protect = authMiddleware;

// Contoh Penggunaan
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};