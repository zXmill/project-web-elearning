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

// Get a single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await db.Course.findByPk(req.params.id); // Changed to db.Course

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kursus tidak ditemukan.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        course,
      },
    });
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data kursus.',
    });
  }
};

exports.getPreTestQuestionsByCourseId = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await db.Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Kursus tidak ditemukan.' });
    }

    if (!course.needsPreTest) {
      return res.status(400).json({ status: 'fail', message: 'Kursus ini tidak memerlukan pre-test.' });
    }

    // Find the pre-test module for this course
    const preTestModule = await db.Module.findOne({
      where: {
        courseId: courseId,
        isPreTest: true
      }
    });

    if (!preTestModule) {
      return res.status(404).json({ status: 'fail', message: 'Modul pre-test untuk kursus ini tidak ditemukan.' });
    }

    // Get all questions for that pre-test module
    const questions = await db.Question.findAll({
      where: { moduleId: preTestModule.id },
      attributes: ['id', 'teksSoal', 'type', 'options', 'correctOptionId'] // Specify attributes to send
    });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Tidak ada soal pre-test yang ditemukan untuk modul ini.' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        courseTitle: course.judul,
        moduleTitle: preTestModule.judul,
        questions: questions
      }
    });

  } catch (error) {
    console.error('Error fetching pre-test questions:', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil soal pre-test.' });
  }
};

exports.getPostTestQuestionsByCourseId = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await db.Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Kursus tidak ditemukan.' });
    }

    // Find the post-test module for this course
    const postTestModule = await db.Module.findOne({
      where: {
        courseId: courseId,
        isPostTest: true // Key difference: check for isPostTest
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
        type: { [Op.notIn]: ['pre_test', 'post_test'] } // Exclude pre-test and post-test types
      },
      order: [['order', 'ASC']], // Order by the 'order' field
      attributes: ['id', 'judul', 'type', 'contentText', 'pdfPath', 'videoLink', 'order']
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

    // Find or create UserProgress record
    let userProgress = await db.UserProgress.findOne({
      where: { userId: userId, courseId: courseId },
    });

    if (!userProgress) {
      // Check if user is enrolled. If not, they shouldn't be marking progress.
      const enrollment = await db.Enrollment.findOne({ where: { userId: userId, courseId: courseId }});
      if (!enrollment) {
        return res.status(403).json({ status: 'fail', message: 'Anda belum terdaftar di kursus ini untuk menandai progres.' });
      }
      // If enrolled but no progress record, create one.
      userProgress = await db.UserProgress.create({
        userId: userId,
        courseId: courseId,
        progressDetails: {}, // Initialize progressDetails
      });
    }

    // Update progressDetails
    const currentProgressDetails = userProgress.progressDetails || {};
    currentProgressDetails[moduleId] = {
      completed: true,
      completedAt: new Date().toISOString(),
    };

    userProgress.progressDetails = currentProgressDetails;
    // Sequelize handles JSON stringification. Mark as changed if direct manipulation.
    userProgress.changed('progressDetails', true); 

    await userProgress.save();

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
    if (!testModule.isPreTest && !testModule.isPostTest) {
      return res.status(400).json({ status: 'fail', message: 'Modul ini bukan modul tes (pre-test/post-test).' });
    }

    // Find or create UserProgress record
    let userProgress = await db.UserProgress.findOne({
      where: { userId: userId, courseId: courseId },
    });

    if (!userProgress) {
      const enrollment = await db.Enrollment.findOne({ where: { userId: userId, courseId: courseId }});
      if (!enrollment) {
        return res.status(403).json({ status: 'fail', message: 'Anda belum terdaftar di kursus ini untuk mencatat skor tes.' });
      }
      userProgress = await db.UserProgress.create({
        userId: userId,
        courseId: courseId,
        progressDetails: {},
      });
    }

    // Update score and progressDetails
    const currentProgressDetails = userProgress.progressDetails || {};
    let testTypeKey = '';

    if (testModule.isPreTest) {
      userProgress.preTestScore = score;
      testTypeKey = `preTest_${moduleId}`;
      // Mark pre-test module as "completed" in progressDetails as well
      currentProgressDetails[moduleId] = { completed: true, completedAt: new Date().toISOString(), score: score, answers: answers };
    } else if (testModule.isPostTest) {
      userProgress.postTestScore = score;
      testTypeKey = `postTest_${moduleId}`;
      // Mark post-test module as "completed"
      currentProgressDetails[moduleId] = { completed: true, completedAt: new Date().toISOString(), score: score, answers: answers };
    }
    
    // Also add a more generic entry for the test itself if needed, e.g. using testTypeKey
    // currentProgressDetails[testTypeKey] = { score: score, submittedAt: new Date().toISOString(), answers: answers };

    userProgress.progressDetails = currentProgressDetails;
    userProgress.changed('progressDetails', true);

    await userProgress.save();

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
    const courseId = parseInt(req.params.courseId, 10);

    if (!req.user || typeof req.user.id === 'undefined') {
      return res.status(401).json({
        status: 'fail',
        message: 'Autentikasi pengguna gagal atau ID pengguna tidak ditemukan.',
      });
    }
    const userId = req.user.id;

    if (isNaN(courseId)) {
      return res.status(400).json({ status: 'fail', message: 'ID Kursus tidak valid.' });
    }

    // Check if course exists
    const course = await db.Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Kursus tidak ditemukan.' });
    }
    
    // Find UserProgress record
    let userProgress = await db.UserProgress.findOne({
      where: { userId: userId, courseId: courseId },
    });

    if (!userProgress) {
      // If no progress record, check if enrolled. If so, it means they haven't started.
      const enrollment = await db.Enrollment.findOne({ where: { userId: userId, courseId: courseId }});
      if (enrollment) {
        // User is enrolled but has no progress, return default/empty progress
        return res.status(200).json({
          status: 'success',
          message: 'Pengguna terdaftar tetapi belum ada progres.',
          data: {
            courseId: courseId,
            userId: userId,
            preTestScore: null,
            postTestScore: null,
            progressDetails: {},
            completedModules: 0, // Or calculate based on an empty progressDetails
            // Any other default fields from UserProgress model
          },
        });
      } else {
        // Not enrolled, so no progress to show
        return res.status(403).json({ status: 'fail', message: 'Anda tidak terdaftar di kursus ini.' });
      }
    }
    
    // Optionally, calculate completion percentage or other derived stats here
    // For example, count completed modules from progressDetails
    let completedModulesCount = 0;
    if (userProgress.progressDetails) {
        Object.values(userProgress.progressDetails).forEach(detail => {
            if (detail && detail.completed === true) {
                // Ensure we are not double counting if test modules are also in progressDetails
                // This simple count assumes any 'completed:true' entry is a distinct module.
                // A more robust way would be to fetch actual course modules and check against them.
                completedModulesCount++;
            }
        });
    }
    // If UserProgress model has a 'completedModules' field that is accurately maintained, use that instead.
    // For now, using the calculated one.
    // userProgress.completedModules = completedModulesCount; // This would be a non-persistent update for response only

    res.status(200).json({
      status: 'success',
      message: 'Progres pengguna berhasil diambil.',
      data: {
        ...userProgress.toJSON(), // Send the full progress record
        calculatedCompletedModules: completedModulesCount, // Example of adding a derived value
      },
    });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil progres pengguna.',
    });
  }
};

// Check certificate eligibility for a course
exports.checkCertificateEligibility = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    if (!req.user || typeof req.user.id === 'undefined') {
      return res.status(401).json({ status: 'fail', message: 'Autentikasi pengguna gagal.' });
    }
    const userId = req.user.id;

    if (isNaN(courseId)) {
      return res.status(400).json({ status: 'fail', message: 'ID Kursus tidak valid.' });
    }

    // 1. Fetch Course and User details
    const course = await db.Course.findByPk(courseId);
    const user = await db.User.findByPk(userId, { attributes: ['id', 'nama', 'email'] }); // Fetch user name

    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Kursus tidak ditemukan.' });
    }
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Pengguna tidak ditemukan.' });
    }

    // 2. Fetch UserProgress
    const userProgress = await db.UserProgress.findOne({
      where: { userId: userId, courseId: courseId },
    });

    if (!userProgress) {
      return res.status(200).json({
        status: 'success',
        eligible: false,
        message: 'Progres pengguna tidak ditemukan. Anda mungkin belum memulai kursus ini.',
        reasons: ['Belum memulai kursus atau progres tidak tercatat.'],
      });
    }

    const reasons = [];
    let eligible = true;

    // 3. Check Post-Test Score
    if (course.needsPostTest) { // Assuming Course model has 'needsPostTest' and 'minimumPostTestScore'
      if (userProgress.postTestScore === null || userProgress.postTestScore < (course.minimumPostTestScore || 70)) {
        eligible = false;
        reasons.push(`Skor post-test (${userProgress.postTestScore || 'Belum ada'}) di bawah minimum (${course.minimumPostTestScore || 70}).`);
      }
    } else {
      // If no post-test is needed, this condition is met by default for certificate.
      // Or, if a course *always* needs a post-test for a certificate, this logic might change.
      // For now, assuming if needsPostTest is false, this check is passed.
    }

    // 4. Check Completion of all non-test modules
    const contentModules = await db.Module.findAll({
      where: {
        courseId: courseId,
        isPreTest: false,
        isPostTest: false,
      },
      attributes: ['id'],
    });

    if (contentModules.length > 0) {
      let allModulesCompleted = true;
      for (const module of contentModules) {
        if (!userProgress.progressDetails || !userProgress.progressDetails[module.id] || !userProgress.progressDetails[module.id].completed) {
          allModulesCompleted = false;
          reasons.push(`Modul konten (ID: ${module.id}) belum selesai.`);
          // break; // Can break early if one module is not completed
        }
      }
      if (!allModulesCompleted) {
        eligible = false;
        // Reason already added
      }
    } else {
      // No content modules in the course. If post-test passed (or not required), then eligible.
    }
    
    // 5. Check Enrollment (Implicitly handled by UserProgress existence, but good to be sure)
    const enrollment = await db.Enrollment.findOne({ where: { userId: userId, courseId: courseId }});
    if (!enrollment) {
        eligible = false;
        reasons.push('Anda tidak terdaftar di kursus ini.');
    }


    if (eligible) {
      // Determine completion date - could be postTest submission date or last module completion date
      let completionDate = userProgress.updatedAt; // Fallback to UserProgress update
      // A more specific date could be found by looking at timestamps in progressDetails
      // For example, the timestamp of the post-test completion or the last content module.
      // This requires iterating through progressDetails and finding the latest relevant timestamp.
      // For simplicity, using userProgress.updatedAt for now.

      res.status(200).json({
        status: 'success',
        eligible: true,
        message: 'Selamat! Anda berhak mendapatkan sertifikat.',
        data: {
          userName: user.nama,
          courseName: course.judul,
          completionDate: completionDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          // Potentially add instructorName if available on Course model
        },
      });
    } else {
      res.status(200).json({
        status: 'success', // Still a successful check, just not eligible
        eligible: false,
        message: 'Anda belum memenuhi syarat untuk mendapatkan sertifikat.',
        reasons: reasons,
      });
    }

  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal memeriksa kelayakan sertifikat.',
    });
  }
};
