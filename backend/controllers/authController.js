const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // For generating reset token
const { User } = require('../models');
const { Op } = require('sequelize'); // Import Op for query operators
const sendEmail = require('../utils/email'); // Import the email utility
const { authMiddleware } = require('../middleware/auth');

// Generate JWT Token
const signToken = (id, role, email) => {
  return jwt.sign(
    { id, role, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Google OAuth
exports.googleLogin = async (req, res) => {
  try {
    const token = signToken(req.user.id, req.user.role, req.user.email);
    res.redirect(`${process.env.FRONTEND_URL}/auth-redirect?token=${token}`);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat login dengan Google'
    });
  }
};

// Request Password Reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'fail', message: 'Email harus diisi.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // To prevent email enumeration, send a generic success message even if user not found
      // In a real app, you'd log this attempt or handle it differently.
      console.log(`Password reset request for non-existent email: ${email}`);
      return res.status(200).json({ 
        status: 'success', 
        message: 'Jika email Anda terdaftar, Anda akan menerima instruksi reset password.' 
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to user model
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

    await user.save();

    // Create reset URL
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Prepare email content
    const emailSubject = 'Reset Password Akun Teraplus Anda';
    const emailText = `Anda menerima email ini karena Anda (atau seseorang) meminta untuk mereset password akun Teraplus Anda.\n\nSilakan klik link berikut, atau paste ke browser Anda untuk menyelesaikan prosesnya:\n\n${resetURL}\n\nJika Anda tidak meminta ini, abaikan email ini dan password Anda akan tetap tidak berubah.\nLink ini akan kedaluwarsa dalam 10 menit.`;
    const emailHtml = `
      <p>Anda menerima email ini karena Anda (atau seseorang) meminta untuk mereset password akun Teraplus Anda.</p>
      <p>Silakan klik link berikut, atau paste ke browser Anda untuk menyelesaikan prosesnya:</p>
      <p><a href="${resetURL}" target="_blank">${resetURL}</a></p>
      <p>Jika Anda tidak meminta ini, abaikan email ini dan password Anda akan tetap tidak berubah.</p>
      <p>Link ini akan kedaluwarsa dalam 10 menit.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });

      res.status(200).json({
        status: 'success',
        message: 'Instruksi untuk mereset password Anda telah dikirim ke email Anda.',
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Important: Clear the reset token fields if email sending fails to allow user to try again
      // without being locked out by an existing token they never received.
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save({ validate: false }); // Skip validation as we are clearing

      return res.status(500).json({
        status: 'error',
        message: 'Gagal mengirim email reset password. Silakan coba lagi.',
      });
    }

  } catch (error) {
    console.error('Error requesting password reset:', error);
    // Clear token fields if error occurs after setting them
    if (req.body.email) {
        const userToClear = await User.findOne({ where: { email: req.body.email } });
        if (userToClear) {
            userToClear.passwordResetToken = null;
            userToClear.passwordResetExpires = null;
            await userToClear.save({ validate: false }); // Skip validation as we are clearing
        }
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal memproses permintaan reset password.'
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;

    if (!password || !passwordConfirm) {
        return res.status(400).json({ status: 'fail', message: 'Password dan konfirmasi password harus diisi.' });
    }
    if (password !== passwordConfirm) {
        return res.status(400).json({ status: 'fail', message: 'Password dan konfirmasi password tidak cocok.' });
    }
    if (password.length < 6) { // Example: Minimum password length
        return res.status(400).json({ status: 'fail', message: 'Password minimal harus 6 karakter.' });
    }


    // 1. Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [Op.gt]: Date.now() } // Check if token is not expired
      }
    });

    // 2. If token has not expired, and there is user, set the new password
    if (!user) {
      return res.status(400).json({ status: 'fail', message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }

    // User model's setter will hash the password
    user.password = password; 
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // 3. Log the user in, send JWT (optional, or just confirm success)
    // For simplicity, just confirming success. User can login with new password.
    res.status(200).json({
      status: 'success',
      message: 'Password berhasil direset. Silakan login dengan password baru Anda.'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mereset password.'
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
    const token = signToken(user.id, user.role, user.email);

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

// User Registration
exports.registerUser = async (req, res) => {
  try {
    const { namaLengkap, email, password, affiliasi, noHp } = req.body; // Added affiliasi, noHp

    // 1. Validate input
    // Make affiliasi and noHp required as per the new requirement
    if (!namaLengkap || !email || !password || !affiliasi || !noHp) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nama lengkap, email, password, affiliasi, dan nomor HP harus diisi',
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email sudah terdaftar',
      });
    }

    // 3. Password will be hashed by the User model's setter

    // 4. Create new user
    const newUser = await User.create({
      namaLengkap,
      email,
      password: password, // Pass plain text password, model will hash it
      affiliasi,          // Added affiliasi
      noHp,               // Added noHp
      role: 'user', // Default role
    });

    // 5. Send response (excluding password)
    // Optionally, generate and send a token here for auto-login
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: newUser.id,
          namaLengkap: newUser.namaLengkap,
          email: newUser.email,
          role: newUser.role,
          affiliasi: newUser.affiliasi, // Added affiliasi to response
          noHp: newUser.noHp,           // Added noHp to response
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat registrasi: ' + error.message,
    });
  }
};

// Protect Route Contoh
exports.protect = authMiddleware;

// Get Current Logged-In User's Profile (renamed from getCurrentUser)
exports.getUserProfile = async (req, res) => {
  try {
    // req.user.id is populated by authMiddleware
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'namaLengkap', 'email', 'role', 'profilePicture', 'googleId', 'createdAt', 'updatedAt', 'affiliasi', 'noHp'] // Specify fields to return, added affiliasi and noHp
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pengguna tidak ditemukan.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil profil pengguna.'
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { namaLengkap, affiliasi, noHp } = req.body; // Allow updating affiliasi and noHp as well

    if (!namaLengkap || typeof namaLengkap !== 'string' || namaLengkap.trim() === '') {
        return res.status(400).json({
            status: 'fail',
            message: 'Nama lengkap harus diisi dan tidak boleh kosong.'
        });
    }
    if (!affiliasi || typeof affiliasi !== 'string' || affiliasi.trim() === '') {
        return res.status(400).json({
            status: 'fail',
            message: 'Affiliasi harus diisi dan tidak boleh kosong.'
        });
    }
    if (!noHp || typeof noHp !== 'string' || noHp.trim() === '') {
        return res.status(400).json({
            status: 'fail',
            message: 'No HP harus diisi dan tidak boleh kosong.'
        });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pengguna tidak ditemukan.'
      });
    }

    user.namaLengkap = namaLengkap.trim();
    user.affiliasi = affiliasi.trim();
    user.noHp = noHp.trim();
    await user.save();

    // Return updated user, excluding sensitive fields
    const updatedUser = await User.findByPk(user.id, {
        attributes: ['id', 'namaLengkap', 'email', 'role', 'profilePicture', 'createdAt', 'updatedAt', 'affiliasi', 'noHp']
    });

    res.status(200).json({
      status: 'success',
      message: 'Profil berhasil diperbarui.',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: error.errors.map(e => e.message).join(', ')
        });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui profil pengguna.'
    });
  }
};

// Upload Profile Picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tidak ada file gambar yang diunggah.'
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pengguna tidak ditemukan.'
      });
    }

    // Construct the path to be stored. Assuming 'uploads' is served statically at the root.
    // e.g., if file is in backend/uploads/profile-pictures/user-id-timestamp.png
    // and backend/uploads is served as /uploads, then path is /uploads/profile-pictures/filename
    const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;
    user.profilePicture = profilePicturePath;
    await user.save();

    // Return updated user, excluding sensitive fields
    const updatedUser = await User.findByPk(user.id, {
        attributes: ['id', 'namaLengkap', 'email', 'role', 'profilePicture', 'createdAt', 'updatedAt', 'affiliasi', 'noHp'] // Added affiliasi and noHp
    });

    res.status(200).json({
      status: 'success',
      message: 'Foto profil berhasil diunggah.',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    // Multer might throw errors if fileFilter fails, or other fs errors
    if (error.message === 'Only JPEG and PNG images are allowed') {
        return res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengunggah foto profil.'
    });
  }
};
