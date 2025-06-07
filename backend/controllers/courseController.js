const db = require('../models'); // Changed to import all models via db

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await db.Course.findAll({ // Changed to db.Course
      // You can add attributes to select specific fields if needed
      // attributes: ['id', 'judul', 'deskripsi', 'imageSrc'], // Example if imageSrc is added
      order: [['judul', 'ASC']], // Order by title
    });
    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: {
        courses,
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data kursus.',
    });
  }
};

// Get a single course by ID or Slug
exports.getCourseBySlugOrId = async (req, res) => {
  try {
    const { identifier } = req.params;
    let course;

    // Check if identifier is numeric (likely an ID) or a string (likely a slug)
    if (!isNaN(identifier)) {
      course = await db.Course.findByPk(identifier);
    } else {
      course = await db.Course.findOne({ where: { slug: identifier } });
    }

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kursus tidak ditemukan.',
      });
    }

    // Optionally, include associated data like modules if needed for the detail page
    // Example:
    // const courseWithDetails = await db.Course.findOne({
    //   where: course.id ? { id: course.id } : { slug: course.slug }, // Re-fetch with associations
    //   include: [{ model: db.Module, as: 'modules', order: [['order', 'ASC']] }]
    // });

    res.status(200).json({
      status: 'success',
      data: {
        course: course, // Send the fetched course (or courseWithDetails if you re-fetch)
      },
    });
  } catch (error) {
    console.error('Error fetching course by slug or ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data kursus.',
    });
  }
};

// Renamed from getPreTestQuestionsByCourseId
exports.getPreTestQuestionsByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    let course;

    if (!isNaN(identifier)) {
      course = await db.Course.findByPk(identifier);
    } else {
      course = await db.Course.findOne({ where: { slug: identifier } });
    }

    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Kursus tidak ditemukan.' });
    }

    if (!course.needsPreTest) {
      return res.status(400).json({ status: 'fail', message: 'Kursus ini tidak memerlukan pre-test.' });
    }

    // Find the pre-test module for this course
    const preTestModule = await db.Module.findOne({
      where: {
        courseId: course.id, // Use course.id
        type: 'PRE_TEST_QUIZ'
      }
    });

    if (!preTestModule) {
      return res.status(404).json({ status: 'fail', message: 'Modul pre-test untuk kursus ini tidak ditemukan.' });
    }

    // Get all questions for that pre-test module
    const questions = await db.Question.findAll({
      where: { moduleId: preTestModule.id },
      attributes: ['id', 'teksSoal', 'type', 'options', 'correctOptionId', 'explanation']
    });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Tidak ada soal pre-test yang ditemukan untuk modul ini.' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        courseTitle: course.judul,
        moduleTitle: preTestModule.judul,
        moduleId: preTestModule.id,
        questions: questions
      }
    });

  } catch (error) {
    console.error('Error fetching pre-test questions:', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil soal pre-test.' });
  }
};

// Renamed from getPostTestQuestionsByCourseId
exports.getPostTestQuestionsByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    let course;

    if (!isNaN(identifier)) {
      course = await db.Course.findByPk(identifier);
    } else {
      course = await db.Course.findOne({ where: { slug: identifier } });
    }

    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Kursus tidak ditemukan.' });
    }

    // Find the post-test module for this course
    const postTestModule = await db.Module.findOne({
      where: {
        courseId: course.id, // Use course.id
        type: 'POST_TEST_QUIZ'
      }
    });

    if (!postTestModule) {
      return res.status(404).json({ status: 'fail', message: 'Modul post-test untuk kursus ini tidak ditemukan.' });
    }

    // Get all questions for that post-test module
    const questions = await db.Question.findAll({
      where: { moduleId: postTestModule.id },
      attributes: ['id', 'teksSoal', 'type', 'options', 'correctOptionId']
    });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Tidak ada soal post-test yang ditemukan untuk modul ini.' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        courseTitle: course.judul,
        moduleTitle: postTestModule.judul,
        moduleId: postTestModule.id, // Added moduleId for consistency, though not strictly in original
        questions: questions
      }
    });

  } catch (error) {
    console.error('Error fetching post-test questions:', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil soal post-test.' });
  }
};

const { Op } = require('sequelize');

exports.getCourseModules = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await db.Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Kursus tidak ditemukan.' });
    }

    const modules = await db.Module.findAll({
      where: {
        courseId: courseId,
        type: { [Op.notIn]: ['PRE_TEST_QUIZ', 'POST_TEST_QUIZ'] } // Correct ENUM values
      },
      order: [['order', 'ASC']], // Order by the 'order' field
      attributes: ['id', 'judul', 'type', 'contentText', 'initialContent', 'pdfPath', 'videoLink', 'order']
    });

    if (!modules || modules.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Tidak ada modul konten yang ditemukan untuk kursus ini.' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        courseTitle: course.judul,
        modules: modules
      }
    });

  } catch (error) {
    console.error('Error fetching course modules:', error);
    console.error(error.stack || error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil modul kursus.' });
  }
};

// TODO: Add other course-related controller functions as needed
// For example: createCourse, updateCourse, deleteCourse

// Enroll a user in a course
exports.enrollInCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    // Ensure req.user and req.user.id are available from authMiddleware
    if (!req.user || typeof req.user.id === 'undefined') {
      return res.status(401).json({
        status: 'fail',
        message: 'Autentikasi pengguna gagal atau ID pengguna tidak ditemukan.',
      });
    }
    const userId = req.user.id;

    // Check if courseId is a valid number
    if (isNaN(courseId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'ID Kursus tidak valid.',
      });
    }

    // Check if course exists
    const course = await db.Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kursus tidak ditemukan.',
      });
    }

    // Check if already enrolled
    const existingEnrollment = await db.Enrollment.findOne({
      where: { userId: userId, courseId: courseId },
    });

    if (existingEnrollment) {
      return res.status(409).json({ // 409 Conflict
        status: 'fail',
        message: 'Anda sudah terdaftar di kursus ini.',
      });
    }

    // Create enrollment
    const newEnrollment = await db.Enrollment.create({
      userId: userId,
      courseId: courseId,
      // enrolledAt is handled by defaultValue: Sequelize.NOW
    });

    res.status(201).json({ // 201 Created
      status: 'success',
      message: 'Berhasil mendaftar ke kursus.',
      data: {
        enrollment: newEnrollment,
      },
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    // Check for specific Sequelize errors if needed, e.g., unique constraint
    // Though the findOne check should prevent most unique constraint errors here.
    res.status(500).json({
      status: 'error',
      message: 'Gagal mendaftar ke kursus karena kesalahan server.',
    });
  }
};

// Check if the current user is enrolled in a specific course
exports.getEnrollmentStatus = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    // Ensure req.user and req.user.id are available from authMiddleware
    if (!req.user || typeof req.user.id === 'undefined') {
      return res.status(401).json({
        status: 'fail',
        message: 'Autentikasi pengguna gagal atau ID pengguna tidak ditemukan.',
      });
    }
    const userId = req.user.id;

    if (isNaN(courseId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'ID Kursus tidak valid.',
      });
    }

    // Check if course exists to give a more specific error if courseId is invalid
    const course = await db.Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kursus tidak ditemukan.',
      });
    }

    const enrollment = await db.Enrollment.findOne({
      where: {
        userId: userId,
        courseId: courseId,
      },
    });

    if (enrollment) {
      res.status(200).json({
        status: 'success',
        enrolled: true,
        data: {
          enrollmentDetails: enrollment,
        },
      });
    } else {
      res.status(200).json({
        status: 'success',
        enrolled: false,
        message: 'Anda belum terdaftar di kursus ini.',
      });
    }
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal memeriksa status pendaftaran.',
    });
  }
};

// Get all courses the current user is enrolled in
exports.getEnrolledCourses = async (req, res) => {
  try {
    // Ensure req.user and req.user.id are available from authMiddleware
    if (!req.user || typeof req.user.id === 'undefined') {
      return res.status(401).json({
        status: 'fail',
        message: 'Autentikasi pengguna gagal atau ID pengguna tidak ditemukan.',
      });
    }
    const userId = req.user.id;

    const enrollments = await db.Enrollment.findAll({
      where: { userId: userId },
      include: [{
        model: db.Course,
        as: 'course', // This 'as' must match the alias in Enrollment.associate
                       // If no alias, Sequelize might guess or use 'Course'
      }],
      order: [[{ model: db.Course, as: 'course' }, 'judul', 'ASC']] // Order by course title
    });

    // Extract just the course data from enrollments
    const courses = enrollments.map(enrollment => enrollment.course).filter(course => course != null);

    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: {
        courses: courses,
      },
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil daftar kursus yang diikuti.',
    });
  }
};

// Mark a module as complete for the current user
exports.markModuleComplete = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const moduleId = parseInt(req.params.moduleId, 10);

    if (!req.user || typeof req.user.id === 'undefined') {
      return res.status(401).json({
        status: 'fail',
        message: 'Autentikasi pengguna gagal atau ID pengguna tidak ditemukan.',
      });
    }
    const userId = req.user.id;

    if (isNaN(courseId) || isNaN(moduleId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'ID Kursus atau ID Modul tidak valid.',
      });
    }

    // Verify module belongs to the course
    const module = await db.Module.findOne({ where: { id: moduleId, courseId: courseId } });
    if (!module) {
        return res.status(404).json({ status: 'fail', message: 'Modul tidak ditemukan atau tidak termasuk dalam kursus ini.' });
    }

    // Find or create UserProgress record for this user, course, and module
    let userProgress = await db.UserProgress.findOne({
      where: { userId: userId, courseId: courseId, moduleId: moduleId },
    });

    if (!userProgress) {
      // Check if user is enrolled. If not, they shouldn't be marking progress.
      const enrollment = await db.Enrollment.findOne({ where: { userId: userId, courseId: courseId }});
      if (!enrollment) {
        return res.status(403).json({ status: 'fail', message: 'Anda belum terdaftar di kursus ini untuk menandai progres.' });
      }
      // If enrolled but no progress record, create one for this module
      userProgress = await db.UserProgress.create({
        userId: userId,
        courseId: courseId,
        moduleId: moduleId,
        completedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
      });
    } else {
      // Update completion timestamp if not already set
      if (!userProgress.completedAt) {
        userProgress.completedAt = new Date().toISOString();
      }
      userProgress.lastAccessedAt = new Date().toISOString();
      await userProgress.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Modul ditandai sebagai selesai.',
      data: {
        userProgress,
      },
    });

  } catch (error) {
    console.error('Error marking module complete:', error);
    console.error(error.stack || error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menandai modul sebagai selesai.',
    });
  }
};

// Record a test score (pre-test or post-test) for the current user
exports.recordTestScore = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const moduleId = parseInt(req.params.moduleId, 10); // This is the ID of the test module itself
    const { score, answers } = req.body; // answers is an optional array/object of user's answers

    if (!req.user || typeof req.user.id === 'undefined') {
      return res.status(401).json({
        status: 'fail',
        message: 'Autentikasi pengguna gagal atau ID pengguna tidak ditemukan.',
      });
    }
    const userId = req.user.id;

    if (isNaN(courseId) || isNaN(moduleId)) {
      return res.status(400).json({ status: 'fail', message: 'ID Kursus atau ID Modul Tes tidak valid.' });
    }
    if (typeof score !== 'number' || score < 0 || score > 100) { // Assuming score is 0-100
      return res.status(400).json({ status: 'fail', message: 'Skor tidak valid.' });
    }

    // Verify module exists, belongs to the course, and is a test module
    const testModule = await db.Module.findOne({ where: { id: moduleId, courseId: courseId } });
    if (!testModule) {
      return res.status(404).json({ status: 'fail', message: 'Modul tes tidak ditemukan atau tidak termasuk dalam kursus ini.' });
    }
    if (testModule.type !== 'PRE_TEST_QUIZ' && testModule.type !== 'POST_TEST_QUIZ') { // Correct ENUM values
      return res.status(400).json({ status: 'fail', message: 'Modul ini bukan modul tes (pre-test/post-test).' });
    }

    // Find or create UserProgress record
    let userProgress = await db.UserProgress.findOne({
      where: { userId: userId, courseId: courseId, moduleId: moduleId },
    });

    if (!userProgress) {
      const enrollment = await db.Enrollment.findOne({ where: { userId: userId, courseId: courseId }});
      if (!enrollment) {
        return res.status(403).json({ status: 'fail', message: 'Anda belum terdaftar di kursus ini untuk mencatat skor tes.' });
      }
      userProgress = await db.UserProgress.create({
        userId: userId,
        courseId: courseId,
        moduleId: moduleId,
        completedAt: new Date().toISOString(),
        score: score,
        lastAccessedAt: new Date().toISOString(),
      });
    } else {
      // Update score and completion timestamp
      userProgress.score = score;
      if (!userProgress.completedAt) {
        userProgress.completedAt = new Date().toISOString();
      }
      userProgress.lastAccessedAt = new Date().toISOString();
      await userProgress.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Skor tes berhasil dicatat.',
      data: {
        userProgress,
      },
    });

  } catch (error) {
    console.error('Error recording test score:', error);
    console.error(error.stack || error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mencatat skor tes.',
    });
  }
};

// Get user progress for a specific course
exports.getUserProgressForCourse = async (req, res) => {
  try {
    const { identifier } = req.params; // Changed from courseId to identifier
    const userId = req.user.id;

    if (!req.user || typeof userId === 'undefined') { // Check userId directly
      return res.status(401).json({
        status: 'fail',
        message: 'Autentikasi pengguna gagal atau ID pengguna tidak ditemukan.',
      });
    }
    let course;
    if (!isNaN(identifier)) {
      course = await db.Course.findByPk(identifier);
    } else {
      course = await db.Course.findOne({ where: { slug: identifier } });
    }

    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Kursus tidak ditemukan.' });
    }

    const courseId = course.id; // Use the numeric ID from the fetched course

    // Ensure enrollment
    let enrollment = await db.Enrollment.findOne({ where: { userId: userId, courseId: courseId }});
    if (!enrollment) {
      // If not enrolled, create enrollment
      try {
        enrollment = await db.Enrollment.create({
          userId: userId,
          courseId: courseId,
        });
        // Optionally log this auto-enrollment
        console.log(`User ${userId} auto-enrolled in course ${courseId}`);
      } catch (enrollError) {
        // Handle potential errors during enrollment creation (e.g., DB issues)
        console.error('Error auto-enrolling user:', enrollError);
        return res.status(500).json({ status: 'error', message: 'Gagal memproses pendaftaran kursus secara otomatis.' });
      }
    }
    
    // Fetch all UserProgress records for this user and course
    const userProgressRows = await db.UserProgress.findAll({
      where: { userId: userId, courseId: courseId }, // Use numeric courseId
      attributes: ['moduleId', 'completedAt', 'score', 'lastAccessedAt'], // Specify attributes
    });

    // Fetch all modules for the course
    const modules = await db.Module.findAll({
      where: { courseId: courseId }, // Use numeric courseId
      order: [['order', 'ASC']],
      // Specify attributes needed by the frontend context
      attributes: ['id', 'judul', 'type', 'order', 'initialContent', 'contentText', 'videoLink', 'pdfPath', 'courseId']
    });

    // userProgressRows will be an empty array if no progress, which is fine.
    // The enrollment check that returned 403 is now removed as enrollment is guaranteed.
    let completedModulesCount = 0;
    userProgressRows.forEach(row => {
      if (row.completedAt) completedModulesCount++;
    });

    const plainCourse = course.get({ plain: true });
    const plainModules = modules.map(m => m.get({ plain: true }));
    const plainUserProgress = userProgressRows.map(up => up.get({ plain: true }));
    
    const responseData = {
      status: 'success',
      message: 'Modul dan progres pengguna berhasil diambil.',
      data: {
        courseId: plainCourse.id,
        courseTitle: plainCourse.judul,
        modules: plainModules,
        userProgress: plainUserProgress,
      },
    };
    res.status(200).json(responseData);

  } catch (error) {
    console.error('Error fetching user progress:', error);
    console.error(error.stack); // Ensure stack trace is logged for any errors
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil progres pengguna.',
    });
  }
};

const PDFDocument = require('pdfkit');
const fs = require('fs'); // For potential font loading, though not used in this basic example

// Helper function to get eligibility data (extracted and adapted from checkCertificateEligibility)
async function getCertificateEligibilityData(userId, identifier) { // Changed courseId to identifier
  // 1. Fetch Course and User details
  let course;
  if (!isNaN(identifier)) {
    course = await db.Course.findByPk(identifier);
  } else {
    course = await db.Course.findOne({ where: { slug: identifier } });
  }
  const user = await db.User.findByPk(userId, { attributes: ['id', 'namaLengkap', 'email'] });

  if (!course) {
    return { eligible: false, message: 'Kursus tidak ditemukan.', reasons: ['Kursus tidak ditemukan.'] };
  }
  const courseId = course.id; // Use numeric ID internally

  if (!user) {
    return { eligible: false, message: 'Pengguna tidak ditemukan.', reasons: ['Pengguna tidak ditemukan.'] };
  }

  // 2. Fetch all UserProgress records for this user and course
  const userProgressRows = await db.UserProgress.findAll({
    where: { userId: userId, courseId: courseId },
  });

  if (!userProgressRows || userProgressRows.length === 0) {
    return {
      eligible: false,
      message: 'Progres pengguna tidak ditemukan. Anda mungkin belum memulai kursus ini.',
      reasons: ['Belum memulai kursus atau progres tidak tercatat.'],
    };
  }

  const reasons = [];
  let eligible = true;

  // 3. Check Post-Test Score
  const postTestModule = await db.Module.findOne({
    where: { courseId: courseId, type: 'POST_TEST_QUIZ' }, // Correct ENUM value
  });
  let postTestScore = null;
  if (postTestModule) {
    const postTestProgress = userProgressRows.find(row => row.moduleId === postTestModule.id);
    if (postTestProgress) {
        postTestScore = postTestProgress.score; // Score can be null if attempted but not scored, or if column is nullable
    }
    
    if (course.needsPostTest) { // Assuming Course model has needsPostTest and minimumPostTestScore
      if (postTestScore === null || postTestScore < (course.minimumPostTestScore || 70)) {
        eligible = false;
        const reasonMsg = `Skor post-test (${postTestScore !== null ? postTestScore : 'Belum ada'}) di bawah minimum (${course.minimumPostTestScore || 70}).`;
        reasons.push(reasonMsg);
      }
    }
  } else if (course.needsPostTest) {
    eligible = false;
    const reasonMsg = 'Modul post-test tidak ditemukan untuk kursus ini.';
    reasons.push(reasonMsg);
  }


  // 4. Check Completion of all non-test modules
  const contentModules = await db.Module.findAll({
    where: {
      courseId: courseId,
      type: { [Op.notIn]: ['PRE_TEST_QUIZ', 'POST_TEST_QUIZ'] } // Correct ENUM values
    },
    attributes: ['id', 'judul'], // Added judul for better reason messages
  });

  if (contentModules.length > 0) {
    let allContentModulesCompleted = true;
    for (const module of contentModules) {
      const progress = userProgressRows.find(row => row.moduleId === module.id);
      if (!progress || !progress.completedAt) {
        allContentModulesCompleted = false;
        reasons.push(`Modul konten "${module.judul}" (ID: ${module.id}) belum selesai.`);
      }
    }
    if (!allContentModulesCompleted) {
      eligible = false;
    }
  }

  // 5. Check Enrollment
  const enrollment = await db.Enrollment.findOne({ where: { userId: userId, courseId: courseId }});
  if (!enrollment) {
      eligible = false;
      reasons.push('Anda tidak terdaftar di kursus ini.');
  }

  if (eligible) {
    let completionDate = null;
    userProgressRows.forEach(row => {
      if (row.completedAt && (!completionDate || new Date(row.completedAt) > new Date(completionDate))) {
        completionDate = row.completedAt;
      }
    });
    completionDate = completionDate ? new Date(completionDate) : new Date();

    return {
      eligible: true,
      data: {
        userName: user.namaLengkap, // Changed user.nama to user.namaLengkap
        courseName: course.judul,
        completionDate: completionDate.toISOString().split('T')[0],
      },
    };
  } else {
    return {
      eligible: false,
      message: 'Anda belum memenuhi syarat untuk mendapatkan sertifikat.',
      reasons: reasons.length > 0 ? reasons : ['Syarat kelulusan belum terpenuhi.'],
    };
  }
}


// Check certificate eligibility for a course
exports.checkCertificateEligibility = async (req, res) => {
  try {
    const { identifier } = req.params; // Changed from courseId
    const userId = req.user.id;

    if (!req.user || typeof userId === 'undefined') {
      return res.status(401).json({ status: 'fail', message: 'Autentikasi pengguna gagal.' });
    }
    // No need to check isNaN for identifier here, getCertificateEligibilityData will handle it

    const eligibilityResult = await getCertificateEligibilityData(userId, identifier); // Pass identifier

    if (eligibilityResult.eligible) {
      // Construct fileName similar to how it's done in downloadCertificate
      const courseNameForFile = eligibilityResult.data.courseName.replace(/\s+/g, '_');
      const userNameForFile = eligibilityResult.data.userName.replace(/\s+/g, '_');
      const fileName = `Sertifikat-${courseNameForFile}-${userNameForFile}.pdf`;
      
      // Use the original identifier (slug or ID) for the URL
      const coursePathSegment = identifier; 

      res.status(200).json({
        status: 'success',
        eligible: true,
        message: 'Selamat! Anda berhak mendapatkan sertifikat.',
        data: {
          ...eligibilityResult.data,
          certificateUrl: `/courses/${coursePathSegment}/certificate/download`, 
          fileName: fileName,
        },
      });
    } else {
      res.status(200).json({
        status: 'success',
        eligible: false,
        message: eligibilityResult.message || 'Anda belum memenuhi syarat untuk mendapatkan sertifikat.',
        reasons: eligibilityResult.reasons,
      });
    }

  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    console.error(error.stack); // Log stack trace
    res.status(500).json({
      status: 'error',
      message: 'Gagal memeriksa kelayakan sertifikat.',
    });
  }
};

// Download certificate for a course
exports.downloadCertificate = async (req, res) => {
  try {
    const { identifier } = req.params; // Changed from courseId
    const userId = req.user.id;

    if (!req.user || typeof userId === 'undefined') {
      return res.status(401).json({ status: 'fail', message: 'Autentikasi pengguna gagal.' });
    }
    // No need to check isNaN for identifier here

    const eligibilityResult = await getCertificateEligibilityData(userId, identifier); // Pass identifier

    if (!eligibilityResult.eligible) {
      return res.status(403).json({ // 403 Forbidden as they are not eligible
        status: 'fail',
        message: eligibilityResult.message || 'Anda tidak berhak mendapatkan sertifikat untuk kursus ini.',
        reasons: eligibilityResult.reasons,
      });
    }

    const { userName, courseName, completionDate } = eligibilityResult.data;

    // Create a document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 50
    });

    // Set response headers
    const filename = `Sertifikat-${courseName.replace(/\s+/g, '_')}-${userName.replace(/\s+/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe its output to the response
    doc.pipe(res);

    // Add content
    // Certificate Title
    doc.fontSize(30).font('Helvetica-Bold').text('SERTIFIKAT KELULUSAN', { align: 'center' });
    doc.moveDown(1.5);

    // Awarded to
    doc.fontSize(18).font('Helvetica').text('Dengan ini menyatakan bahwa:', { align: 'center' });
    doc.moveDown(1);

    // User Name
    doc.fontSize(28).font('Helvetica-Bold').text(userName, { align: 'center' });
    doc.moveDown(1);

    // Has successfully completed
    doc.fontSize(18).font('Helvetica').text('Telah berhasil menyelesaikan kursus:', { align: 'center' });
    doc.moveDown(0.5);

    // Course Name
    doc.fontSize(24).font('Helvetica-Bold').text(courseName, { align: 'center' });
    doc.moveDown(1.5);
    
    // Completion Date
    doc.fontSize(16).font('Helvetica').text(`Pada tanggal: ${new Date(completionDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
    doc.moveDown(3);

    // Placeholder for Signature
    doc.fontSize(14).font('Helvetica').text('_________________________', { align: 'right', continued: false });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica').text('Direktur Pelatihan', { align: 'right', continued: false });
    doc.moveDown(0.2);
    doc.fontSize(14).font('Helvetica').text('Nama Institusi', { align: 'right', continued: false });


    // Finalize PDF file
    doc.end();

  } catch (error) {
    console.error('Error generating certificate:', error);
    console.error(error.stack); // Log stack trace
    // Avoid sending PDF headers if an error occurs before doc.pipe(res)
    if (!res.headersSent) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal membuat sertifikat.',
        });
    } else {
        // If headers already sent, we can't send JSON, but we should end the response.
        // The client might receive a partial/corrupted PDF.
        res.end();
    }
  }
};
