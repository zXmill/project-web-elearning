const { User } = require('../models');

exports.isAdmin = async (req, res, next) => {
  try {
    // Assuming user is authenticated and req.user is populated by authMiddleware
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Anda tidak diautentikasi. Silakan login.',
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pengguna tidak ditemukan.',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Anda tidak memiliki izin untuk mengakses sumber daya ini.',
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};
