// Placeholder for admin-specific controller actions
const { User, Course, Setting, Enrollment, UserProgress, Module } = require('../models'); // Import User, Course, Setting, Enrollment, UserProgress, and Module models
const { Op } = require('sequelize'); // Import Op for operators
const bcrypt = require('bcryptjs'); // For hashing password if updated
const xlsx = require('xlsx'); // For parsing Excel files
const { uploadToS3 } = require('../utils/s3Service'); // Import S3 upload utility

exports.getDashboardSummary = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalCourses = await Course.count();
    // Count all enrollments (active means enrolled)
    // Enrollment is already imported at the top of the file
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

// --- Certificate and Practical Test Management per Enrollment ---

const INDONESIAN_PRACTICAL_TEST_STATUSES = [
  'Belum Dikumpulkan',
  'Sudah Dikumpulkan',
  'Lulus Penilaian',
  'Gagal Penilaian',
  'Sertifikat Disetujui',
  'Sertifikat Ditolak'
];

// New function: Get Enrollments for Approval
exports.getEnrollmentsForApproval = async (req, res) => {
  try {
    const enrollmentsData = await Enrollment.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'namaLengkap', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'judul'] }
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!enrollmentsData.length) {
      return res.status(200).json({
        status: 'success',
        message: 'Tidak ada pendaftaran yang memerlukan persetujuan saat ini.',
        data: { enrollments: [] }
      });
    }

    const enrollmentsWithProgress = [];

    for (const enrollment of enrollmentsData) {
      const enrollmentJson = enrollment.toJSON();
      let preTestScore = null;
      let postTestScore = null;
      let userCourseCompletedAt = null; // To store the completion time of the post-test

      // Find pre-test module for this course
      const preTestModule = await Module.findOne({
        where: { courseId: enrollment.courseId, type: 'PRE_TEST_QUIZ' },
        attributes: ['id']
      });

      if (preTestModule) {
        const preTestProgress = await UserProgress.findOne({
          where: {
            userId: enrollment.userId,
            // courseId: enrollment.courseId, // Not strictly needed if moduleId is unique, but good for clarity/indexing
            moduleId: preTestModule.id
          },
          attributes: ['score'] 
        });
        if (preTestProgress) {
          preTestScore = preTestProgress.score;
        }
      }

      // Find post-test module for this course
      const postTestModule = await Module.findOne({
        where: { courseId: enrollment.courseId, type: 'POST_TEST_QUIZ' },
        attributes: ['id']
      });

      if (postTestModule) {
        const postTestProgress = await UserProgress.findOne({
          where: {
            userId: enrollment.userId,
            // courseId: enrollment.courseId, // Not strictly needed if moduleId is unique
            moduleId: postTestModule.id
          },
          attributes: ['score', 'completedAt']
        });
        if (postTestProgress) {
          postTestScore = postTestProgress.score;
          if (postTestProgress.completedAt) {
            userCourseCompletedAt = postTestProgress.completedAt;
          }
        }
      }
      
      enrollmentsWithProgress.push({
        ...enrollmentJson,
        userProgress: { 
          preTestScore: preTestScore,
          postTestScore: postTestScore,
          completedAt: userCourseCompletedAt 
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { enrollments: enrollmentsWithProgress }
    });

  } catch (error) {
    console.error('Error fetching enrollments for approval:', error);
    console.error(error.stack); // Log full stack trace
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data pendaftaran untuk persetujuan.'
    });
  }
};

// New function: Update Enrollment Practical Test Details
exports.updateEnrollmentPracticalTestDetails = async (req, res) => {
  const { enrollmentId } = req.params;
  const { practicalTestStatus, practicalTestAdminNotes } = req.body;

  if (practicalTestStatus && !INDONESIAN_PRACTICAL_TEST_STATUSES.includes(practicalTestStatus)) {
    return res.status(400).json({
      status: 'fail',
      message: `Status tes praktik tidak valid. Harus salah satu dari: ${INDONESIAN_PRACTICAL_TEST_STATUSES.join(', ')}.`,
    });
  }

  try {
    const enrollment = await Enrollment.findByPk(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ status: 'fail', message: 'Pendaftaran tidak ditemukan.' });
    }

    let updated = false;
    if (practicalTestStatus !== undefined) {
      enrollment.practicalTestStatus = practicalTestStatus;
      updated = true;
    }
    if (practicalTestAdminNotes !== undefined) {
      enrollment.practicalTestAdminNotes = practicalTestAdminNotes;
      updated = true;
    }

    if (updated) {
      // Only update certificateStatusUpdatedAt if a relevant field is changed.
      enrollment.certificateStatusUpdatedAt = new Date(); 
      await enrollment.save({ loggingContext: `adminUpdateEnrollmentPracticalTest-${enrollmentId}` });
    }

    res.status(200).json({
      status: 'success',
      message: 'Detail tes praktik pendaftaran berhasil diperbarui.',
      data: { enrollment: enrollment.toJSON() },
    });
  } catch (error) {
    console.error(`Error updating practical test details for enrollment ${enrollmentId}:`, error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.errors.map(e => e.message).join(', '),
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui detail tes praktik pendaftaran.',
    });
  }
};

// New function: Approve Enrollment Certificate
exports.approveEnrollmentCertificate = async (req, res) => {
  const { enrollmentId } = req.params;

  try {
    const enrollment = await Enrollment.findByPk(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ status: 'fail', message: 'Pendaftaran tidak ditemukan.' });
    }

    // Optional: Add eligibility checks, e.g., practicalTestStatus should be 'Lulus Penilaian'
    // if (enrollment.practicalTestStatus !== 'Lulus Penilaian') {
    //   return res.status(400).json({ status: 'fail', message: 'Tes praktik pendaftaran belum "Lulus Penilaian". Tidak dapat menyetujui sertifikat.' });
    // }

    enrollment.certificateAdminApprovedAt = new Date();
    enrollment.practicalTestStatus = 'Sertifikat Disetujui';
    enrollment.certificateRejectionReason = null; // Clear any previous rejection reason
    enrollment.certificateStatusUpdatedAt = new Date();
    
    await enrollment.save({ loggingContext: `adminApproveEnrollmentCertificate-${enrollmentId}` });

    res.status(200).json({
      status: 'success',
      message: 'Sertifikat untuk pendaftaran berhasil disetujui.',
      data: { enrollment: enrollment.toJSON() },
    });
  } catch (error) {
    console.error(`Error approving certificate for enrollment ${enrollmentId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menyetujui sertifikat untuk pendaftaran.',
    });
  }
};

// New function: Reject Enrollment Certificate
exports.rejectEnrollmentCertificate = async (req, res) => {
  const { enrollmentId } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim() === '') {
    return res.status(400).json({
      status: 'fail',
      message: 'Alasan penolakan diperlukan dan tidak boleh kosong.',
    });
  }

  try {
    const enrollment = await Enrollment.findByPk(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ status: 'fail', message: 'Pendaftaran tidak ditemukan.' });
    }

    enrollment.certificateAdminApprovedAt = null; // Clear approval date
    enrollment.practicalTestStatus = 'Sertifikat Ditolak';
    enrollment.certificateRejectionReason = rejectionReason.trim();
    enrollment.certificateStatusUpdatedAt = new Date();

    await enrollment.save({ loggingContext: `adminRejectEnrollmentCertificate-${enrollmentId}` });

    res.status(200).json({
      status: 'success',
      message: 'Sertifikat untuk pendaftaran berhasil ditolak.',
      data: { enrollment: enrollment.toJSON() },
    });
  } catch (error) {
    console.error(`Error rejecting certificate for enrollment ${enrollmentId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menolak sertifikat untuk pendaftaran.',
    });
  }
};

// Controller to update a user's practical test status and admin notes
exports.updateUserPracticalTest = async (req, res) => {
  const { userId } = req.params;
  const { practicalTestStatus, practicalTestAdminNotes } = req.body;

  // Validate practicalTestStatus
  const allowedStatuses = ['Assigned', 'Submitted', 'Pending Review', 'Approved', 'Rejected'];
  if (practicalTestStatus && !allowedStatuses.includes(practicalTestStatus)) {
    return res.status(400).json({
      status: 'fail',
      message: `Status tes praktik tidak valid. Harus salah satu dari: ${allowedStatuses.join(', ')}.`,
    });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Pengguna tidak ditemukan.' });
    }

    if (practicalTestStatus !== undefined) {
      user.practicalTestStatus = practicalTestStatus;
    }
    if (practicalTestAdminNotes !== undefined) {
      user.practicalTestAdminNotes = practicalTestAdminNotes;
    }
    // If status is 'Assigned' and no practicalTestAssigned yet, admin might need to set it via updateUser or another dedicated endpoint.
    // This function primarily focuses on status and notes after assignment/submission.

    await user.save({ loggingContext: 'adminChangePracticalTest' });

    const userResponse = { ...user.toJSON() };
    delete userResponse.password;
    delete userResponse.googleId;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;

    res.status(200).json({
      status: 'success',
      message: 'Status tes praktik pengguna berhasil diperbarui.',
      data: { user: userResponse },
    });
  } catch (error) {
    console.error(`Error updating practical test status for user ${userId}:`, error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.errors.map(e => e.message).join(', '),
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui status tes praktik pengguna.',
    });
  }
};

// Controller to approve a user's certificate
exports.approveUserCertificate = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Pengguna tidak ditemukan.' });
    }

    // Potentially check if user is eligible for certificate before approving (e.g., practicalTestStatus === 'Approved')
    // For now, this endpoint directly approves.
    // if (user.practicalTestStatus !== 'Approved') {
    //   return res.status(400).json({ status: 'fail', message: 'Tes praktik pengguna belum "Approved". Tidak dapat menyetujui sertifikat.' });
    // }

    user.certificateAdminApprovedAt = new Date();
    await user.save({ loggingContext: 'adminApproveCertificate' });

    const userResponse = { ...user.toJSON() };
    delete userResponse.password;
    delete userResponse.googleId;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;

    res.status(200).json({
      status: 'success',
      message: 'Sertifikat pengguna berhasil disetujui oleh admin.',
      data: { user: userResponse },
    });
  } catch (error) {
    console.error(`Error approving certificate for user ${userId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menyetujui sertifikat pengguna.',
    });
  }
};

// --- Site Settings ---
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // If no settings row exists, create one with default values
      settings = await Setting.create({}); // Defaults are defined in the model
    }
    res.status(200).json({
      status: 'success',
      data: {
        settings
      }
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil pengaturan situs.'
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      // Exclude 'id', 'createdAt', 'updatedAt' from direct update
      const { id, createdAt, updatedAt, ...updateData } = req.body;
      await settings.update(updateData);
    }
    
    // Refetch to ensure we have the latest, including any defaults applied on creation
    const updatedSettings = await Setting.findByPk(settings.id);

    res.status(200).json({
      status: 'success',
      message: 'Pengaturan situs berhasil diperbarui.',
      data: {
        settings: updatedSettings
      }
    });
  } catch (error)
 {
    console.error('Error updating site settings:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui pengaturan situs.'
    });
  }
};

// Controller for uploading PDF files from Rich Text Editor
exports.uploadContentPdf = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'fail',
      message: 'Tidak ada file PDF yang diunggah.',
    });
  }

  try {
    const s3UploadResult = await uploadToS3(req.file, 'content-pdfs');
    res.status(200).json({
      status: 'success',
      message: 'File PDF berhasil diunggah.',
      data: {
        url: s3UploadResult.url, // URL to access the file from S3
        filename: req.file.originalname, // Original filename might be more user-friendly
      },
    });
  } catch (error) {
    console.error('Error processing PDF upload:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal memproses unggahan PDF.',
    });
  }
};

// Controller for uploading PDF files for PDF_DOCUMENT module type
exports.uploadModulePdf = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'fail',
      message: 'Tidak ada file PDF yang diunggah.',
    });
  }

  try {
    const s3UploadResult = await uploadToS3(req.file, 'module-pdfs');
    res.status(200).json({
      status: 'success',
      message: 'File PDF modul berhasil diunggah.',
      data: {
        url: s3UploadResult.url, // URL to access the file from S3
        filename: req.file.originalname, // Original filename
      },
    });
  } catch (error) {
    console.error('Error processing module PDF upload:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal memproses unggahan PDF modul.',
    });
  }
};

// Placeholder for Get All Users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      attributes: { 
        exclude: ['password', 'googleId', 'passwordResetToken', 'passwordResetExpires'],
        // Ensure new fields are included if not excluded by default or by a general exclude rule
        // Explicitly including them if 'exclude' is too broad or to be certain.
        // However, Sequelize typically includes all non-excluded fields.
        // For clarity, if User model has many fields, specific include might be better.
        // For now, relying on exclude to work as intended.
        // If new fields are missing, will need to adjust attributes option.
      },
      // To be absolutely sure, we can list the fields to include:
      // attributes: [
      //   'id', 'namaLengkap', 'email', 'role', 'profilePicture', 'affiliasi', 'noHp', 
      //   'isVerified', 'lastLoginAt', 'createdAt', 'updatedAt',
      //   'practicalTestAssigned', 'practicalTestStatus', 'practicalTestFileUrl', 
      //   'practicalTestAdminNotes', 'certificateAdminApprovedAt'
      // ],
      order: [['id', 'ASC']] // Optional: order by ID or another field
    });
    // Map users to ensure new fields are present if they can be null and Sequelize might omit them
    const usersWithAllFields = users.map(user => {
      const userJson = user.toJSON();
      return {
        ...userJson,
        practicalTestAssigned: userJson.practicalTestAssigned || null,
        practicalTestStatus: userJson.practicalTestStatus || null,
        practicalTestFileUrl: userJson.practicalTestFileUrl || null,
        practicalTestAdminNotes: userJson.practicalTestAdminNotes || null,
        certificateAdminApprovedAt: userJson.certificateAdminApprovedAt || null,
      };
    });
    res.status(200).json({
      status: 'success',
      results: usersWithAllFields.length,
      data: {
        users: usersWithAllFields
      }
    });
  } catch (error) {
    console.error('Error fetching all users (admin):', error);
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
    }, { loggingContext: 'adminChange' });
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

    await user.save({ loggingContext: 'adminChange' });

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
    await user.destroy({ loggingContext: 'adminChange' });
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

// Controller for bulk user creation from Excel
exports.bulkCreateUsers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'fail',
      message: 'Tidak ada file Excel yang diunggah.',
    });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const usersData = xlsx.utils.sheet_to_json(worksheet);

    if (!usersData || usersData.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'File Excel kosong atau format tidak sesuai.',
      });
    }

    const usersToCreate = [];
    const errors = [];
    const createdUserEmails = [];
    const skippedUserEmails = [];

    for (const userData of usersData) {
      const {
        namaLengkap, // Changed to match frontend expectation
        email,       // Changed to match frontend expectation
        password,    // Changed to match frontend expectation
        role,        // Changed to match frontend expectation
        affiliasi,   // Added optional field
        noHp         // Added optional field
      } = userData;

      // Validate required fields
      if (!namaLengkap || !email || !password) {
        errors.push({ email: email || `Baris ke-${usersData.indexOf(userData) + 2}`, message: 'namaLengkap, email, dan password diperlukan.' });
        skippedUserEmails.push(email || `Data tidak lengkap baris ke-${usersData.indexOf(userData) + 2}`);
        continue;
      }

      // Validate role
      const lowerCaseRole = role ? String(role).toLowerCase() : 'user'; // Default to 'user' if role is blank
      if (!['user', 'admin'].includes(lowerCaseRole)) {
        errors.push({ email, message: `Role tidak valid: ${role}. Harus "user" atau "admin".` });
        skippedUserEmails.push(email);
        continue;
      }

      try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          errors.push({ email, message: 'Email sudah terdaftar.' });
          skippedUserEmails.push(email);
          continue;
        }

        const userToCreateData = {
          namaLengkap,
          email,
          password, // Password will be hashed by the model's hook
          role: lowerCaseRole,
        };

        if (affiliasi !== undefined && affiliasi !== null) {
          userToCreateData.affiliasi = affiliasi;
        }
        if (noHp !== undefined && noHp !== null) {
          // Basic validation for noHp if needed, e.g., ensure it's a string or number
          userToCreateData.noHp = String(noHp); 
        }

        usersToCreate.push(userToCreateData);
      } catch (dbError) {
        console.error(`Error checking existing user ${email}:`, dbError);
        errors.push({ email, message: `Kesalahan database saat memeriksa pengguna: ${dbError.message}` });
        skippedUserEmails.push(email);
      }
    }

    let createdCount = 0;
    if (usersToCreate.length > 0) {
      try {
        const createdUsers = await User.bulkCreate(usersToCreate, { 
          validate: true, // Ensure model validations are run
          individualHooks: true, // Ensure hooks like password hashing are run for each user
          loggingContext: 'adminChange'
        });
        createdCount = createdUsers.length;
        createdUsers.forEach(u => createdUserEmails.push(u.email));
      } catch (bulkCreateError) {
        console.error('Error during bulk user creation:', bulkCreateError);
        // Handle potential errors from bulkCreate, e.g., if a unique constraint is violated despite prior checks (race condition)
        // or if model validation fails for some reason not caught earlier.
        let errorMessage = 'Gagal membuat pengguna secara massal.';
        if (bulkCreateError.errors && Array.isArray(bulkCreateError.errors)) {
            errorMessage = bulkCreateError.errors.map(e => `${e.path ? e.path + ': ' : ''}${e.message}`).join('; ');
        } else if (bulkCreateError.message) {
            errorMessage = bulkCreateError.message;
        }
        // Add a general error if bulk creation itself fails
        errors.push({ email: 'N/A (Bulk Operation)', message: `Kesalahan saat bulk create: ${errorMessage}` });
      }
    }

    const summary = {
      totalUsersInFile: usersData.length,
      successfullyCreated: createdCount,
      skippedOrFailed: skippedUserEmails.length + (usersToCreate.length - createdCount), // usersToCreate might not all succeed
      createdUserEmails,
      skippedUserEmails, // Contains emails that were duplicates or had validation errors before bulkCreate
      errors, // Contains detailed error messages
    };
    
    if (createdCount > 0 && errors.length === 0) {
        res.status(201).json({
            status: 'success',
            message: `${createdCount} pengguna berhasil dibuat.`,
            data: summary,
        });
    } else if (createdCount > 0 && errors.length > 0) {
        res.status(207).json({ // Multi-Status
            status: 'partial_success',
            message: `Sebagian pengguna berhasil dibuat. ${createdCount} dibuat, ${summary.skippedOrFailed} gagal/dilewati.`,
            data: summary,
        });
    } else if (errors.length > 0 && createdCount === 0) {
        res.status(400).json({
            status: 'fail',
            message: 'Tidak ada pengguna yang dibuat. Periksa error untuk detail.',
            data: summary,
        });
    } else { // No users in file or all skipped before attempting create, but no explicit errors
         res.status(200).json({
            status: 'success', // Or 'no_action_needed'
            message: 'Tidak ada pengguna baru untuk dibuat dari file.',
            data: summary,
        });
    }

  } catch (error) {
    console.error('Error processing bulk user creation:', error);
    res.status(500).json({
      status: 'error',
      message: `Terjadi kesalahan server: ${error.message}`,
    });
  }
};

// --- Get Recent Activities ---
// const { Op } = require('sequelize'); // Op is already imported at the top
// const { UserProgress, Module } = require('../models'); // UserProgress and Module are now imported at the top

exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; 
    // Adjust fetch limits to accommodate more activity types
    const activityTypeCount = 4; // Registrations, Enrollments, Logins, Module Completions
    const individualLimit = Math.ceil(limit / activityTypeCount) + 2; // Fetch a bit more for each type

    // 1. Recent User Registrations
    const recentUserRegistrations = await User.findAll({
      attributes: ['id', 'namaLengkap', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: individualLimit,
    });
    const registrationActivities = recentUserRegistrations.map(user => ({
      id: `user-registration-${user.id}-${new Date(user.createdAt).getTime()}`,
      type: 'user_registration',
      timestamp: user.createdAt,
      message: `${user.namaLengkap || 'A user'} (${user.email || 'No email'}) registered.`,
      user: { id: user.id, namaLengkap: user.namaLengkap, email: user.email }
    }));

    // 2. Recent Course Enrollments
    const recentEnrollments = await Enrollment.findAll({
      include: [
        { association: 'user', attributes: ['id', 'namaLengkap', 'email'] },
        { association: 'course', attributes: ['id', 'judul'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: individualLimit,
    });
    const enrollmentActivities = recentEnrollments.map(enrollment => ({
      id: `enrollment-${enrollment.id}-${new Date(enrollment.createdAt).getTime()}`,
      type: 'course_enrollment',
      timestamp: enrollment.createdAt,
      message: `${enrollment.user ? enrollment.user.namaLengkap : 'A user'} enrolled in ${enrollment.course ? enrollment.course.judul : 'a course'}.`,
      user: enrollment.user ? { id: enrollment.user.id, namaLengkap: enrollment.user.namaLengkap, email: enrollment.user.email } : null,
      course: enrollment.course ? { id: enrollment.course.id, judul: enrollment.course.judul } : null
    }));

    // 3. Recent User Logins
    const recentLogins = await User.findAll({
      attributes: ['id', 'namaLengkap', 'email', 'lastLoginAt'],
      where: {
        lastLoginAt: {
          [Op.ne]: null // Ensure lastLoginAt is not null
        }
      },
      order: [['lastLoginAt', 'DESC']],
      limit: individualLimit,
    });
    const loginActivities = recentLogins.map(user => ({
      id: `user-login-${user.id}-${new Date(user.lastLoginAt).getTime()}`,
      type: 'user_login',
      timestamp: user.lastLoginAt,
      message: `${user.namaLengkap || 'A user'} (${user.email || 'No email'}) logged in.`,
      user: { id: user.id, namaLengkap: user.namaLengkap, email: user.email }
    }));

    // 4. Recent Module Completions (as proxy for "course finished" activity)
    const recentModuleCompletions = await UserProgress.findAll({
      where: {
        completedAt: {
          [Op.ne]: null // Ensure completedAt is not null
        }
      },
      include: [
        { association: 'user', attributes: ['id', 'namaLengkap', 'email'] },
        { association: 'course', attributes: ['id', 'judul'] },
        { association: 'module', attributes: ['id', 'judul', 'type'] } // Corrected 'tipe' to 'type'
      ],
      order: [['completedAt', 'DESC']],
      limit: individualLimit,
    });
    const moduleCompletionActivities = recentModuleCompletions.map(progress => ({
      id: `module-completion-${progress.id}-${new Date(progress.completedAt).getTime()}`,
      type: 'module_completed',
      timestamp: progress.completedAt,
      message: `${progress.user ? progress.user.namaLengkap : 'A user'} completed module "${progress.module ? progress.module.judul : 'a module'}" in course "${progress.course ? progress.course.judul : 'a course'}".`,
      user: progress.user ? { id: progress.user.id, namaLengkap: progress.user.namaLengkap, email: progress.user.email } : null,
      course: progress.course ? { id: progress.course.id, judul: progress.course.judul } : null,
      module: progress.module ? { id: progress.module.id, judul: progress.module.judul, type: progress.module.type } : null, // Corrected 'tipe' to 'type'
    }));
    
    let combinedActivities = [
      ...registrationActivities, 
      ...enrollmentActivities,
      ...loginActivities,
      ...moduleCompletionActivities
    ];

    // Sort by timestamp descending
    combinedActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get the top 'limit' activities
    const finalActivities = combinedActivities.slice(0, limit);

    res.status(200).json({
      status: 'success',
      data: {
        activities: finalActivities,
      },
    });

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil aktivitas terbaru.',
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
