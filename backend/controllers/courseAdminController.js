const { Course, Module, Question, Enrollment, UserProgress, sequelize } = require('../models'); // Added Enrollment, UserProgress, sequelize
const { uploadToS3 } = require('../utils/s3Service'); // Import S3 upload utility

// Helper function to generate a slug
const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (excluding spaces and hyphens)
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/--+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();                  // Trim leading/trailing hyphens/spaces
};

// Get all courses with their modules count
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{
        model: Module,
        as: 'modules',
        attributes: ['id', 'type']
      }],
      order: [['id', 'ASC']]
    });

    const coursesWithStats = courses.map(course => {
      const moduleCount = course.modules.length;
      const hasPreTest = course.modules.some(m => m.type === 'pre_test');
      const hasPostTest = course.modules.some(m => m.type === 'post_test');

      return {
        ...course.toJSON(),
        stats: {
          moduleCount,
          hasPreTest,
          hasPostTest
        }
      };
    });

    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: {
        courses: coursesWithStats
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil daftar kursus.'
    });
  }
};

// Get single course with all its modules and questions
exports.getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id, {
      include: [{
        model: Module,
        as: 'modules',
        include: [{
          model: Question,
          as: 'questions'
        }],
        order: [['order', 'ASC']]
      }]
    });

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kursus tidak ditemukan.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        course
      }
    });
  } catch (error) {
    console.error(`Error fetching course ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil detail kursus.'
    });
  }
};

// Create new course
exports.createCourse = async (req, res) => {
  try {
    const {
      judul,
      deskripsi,
      // imageSrc will come from req.file if uploaded
      area,
      syaratDanKetentuan,
      needsPreTest,
      prerequisites,
      slug: providedSlug // Add slug to destructuring
    } = req.body;

    let imageSrcPath = req.body.imageSrc; // Allow manual URL input as fallback
    if (req.file) {
      const s3UploadResult = await uploadToS3(req.file, 'course-images');
      imageSrcPath = s3UploadResult.url; // Store the S3 URL
    }

    // Validation
    if (!judul) {
      return res.status(400).json({
        status: 'fail',
        message: 'Judul kursus diperlukan.'
      });
    }

    // Generate slug from judul if not provided or if providedSlug is empty
    const slug = providedSlug && providedSlug.trim() !== '' ? generateSlug(providedSlug.trim()) : generateSlug(judul);

    // Check for slug uniqueness before creating
    const existingCourseWithSlug = await Course.findOne({ where: { slug } });
    if (existingCourseWithSlug) {
      return res.status(400).json({
        status: 'fail',
        message: `Slug "${slug}" sudah digunakan. Harap gunakan slug lain.`
      });
    }

    const course = await Course.create({
      judul,
      deskripsi,
      slug, // Add slug to creation
      imageSrc: imageSrcPath, // Use the path from file upload or manual input
      area,
      syaratDanKetentuan,
      needsPreTest: needsPreTest === 'true' || needsPreTest === true, // Handle string 'true' from form data
      prerequisites
    });

    res.status(201).json({
      status: 'success',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('Error creating course:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat kursus baru.'
    });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      judul,
      deskripsi,
      // imageSrc might come from req.file or req.body
      area,
      syaratDanKetentuan,
      needsPreTest,
      prerequisites,
      slug: newSlug // Add slug to destructuring
    } = req.body;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kursus tidak ditemukan.'
      });
    }

    // Update fields if provided
    if (judul !== undefined) course.judul = judul;
    if (deskripsi !== undefined) course.deskripsi = deskripsi;
    
    if (req.file) {
      const s3UploadResult = await uploadToS3(req.file, 'course-images');
      course.imageSrc = s3UploadResult.url; // Store the S3 URL
    } else if (req.body.imageSrc !== undefined) { // Allows clearing or setting a manual URL
      course.imageSrc = req.body.imageSrc;
    }
    // If neither req.file nor req.body.imageSrc is present, imageSrc remains unchanged.

    if (area !== undefined) course.area = area;
    if (syaratDanKetentuan !== undefined) course.syaratDanKetentuan = syaratDanKetentuan;
    if (needsPreTest !== undefined) course.needsPreTest = needsPreTest === 'true' || needsPreTest === true;
    if (prerequisites !== undefined) course.prerequisites = prerequisites;

    if (newSlug !== undefined && newSlug.trim() !== '') {
      const generatedNewSlug = generateSlug(newSlug.trim());
      if (course.slug !== generatedNewSlug) { // Only update if different
        // Check for slug uniqueness before updating
        const existingCourseWithSlug = await Course.findOne({ where: { slug: generatedNewSlug, id: { [require('sequelize').Op.ne]: id } } });
        if (existingCourseWithSlug) {
          return res.status(400).json({
            status: 'fail',
            message: `Slug "${generatedNewSlug}" sudah digunakan. Harap gunakan slug lain.`
          });
        }
        course.slug = generatedNewSlug;
      }
    } else if (newSlug !== undefined && newSlug.trim() === '' && course.slug !== null) {
      // If an empty slug is explicitly provided, set it to null (or handle as error if slugs are mandatory)
      // For now, let's assume an empty slug means "remove current slug" / set to null if DB allows
      // However, if slugs become mandatory, this logic should change.
      // If judul changed and no slug provided, we are NOT auto-regenerating slug here to prevent accidental URL changes.
      // Admin must explicitly provide a new slug or clear it.
      // If you want to allow clearing the slug:
      // course.slug = null; 
      // For now, let's prevent clearing to null if it was previously set, unless explicitly handled.
      // If newSlug is empty string, and you want to auto-generate from title if title changed:
      if (judul && course.judul !== judul && (!newSlug || newSlug.trim() === '')) {
         // This part is tricky: if title changes and slug is empty, do we regenerate?
         // For now, let's say NO. Slug must be explicitly managed.
      }
    }


    await course.save();

    res.status(200).json({
      status: 'success',
      data: {
        course
      }
    });
  } catch (error) {
    console.error(`Error updating course ${req.params.id}:`, error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui kursus.'
    });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Kursus tidak ditemukan.'
      });
    }

    const transaction = await sequelize.transaction();
    try {
      // 1. Find all modules associated with the course
      const modules = await Module.findAll({ where: { courseId: id }, transaction });
      const moduleIds = modules.map(m => m.id);

      if (moduleIds.length > 0) {
        // 2. Delete UserProgress records associated with these modules
        await UserProgress.destroy({ where: { moduleId: moduleIds }, transaction });

        // 3. Delete Questions associated with these modules
        await Question.destroy({ where: { moduleId: moduleIds }, transaction });
      }

      // 4. Delete all Modules associated with the course
      await Module.destroy({ where: { courseId: id }, transaction });

      // 5. Delete all Enrollments for the course
      await Enrollment.destroy({ where: { courseId: id }, transaction });
      
      // 6. Finally, delete the Course itself
      await course.destroy({ transaction });

      await transaction.commit();
      res.status(204).send();

    } catch (err) {
      await transaction.rollback();
      console.error(`Error deleting course ${id} and its associations:`, err);
      // Send a more specific error message if it's a foreign key constraint,
      // though the manual cascade should prevent this.
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ // 409 Conflict
          status: 'error',
          message: 'Gagal menghapus kursus karena masih ada data terkait yang tidak dapat dihapus secara otomatis. Silakan periksa modul, pendaftaran, atau progres pengguna.',
        });
      }
      res.status(500).json({
        status: 'error',
        message: 'Gagal menghapus kursus.'
      });
    }
  } catch (error) { // Outer catch for initial findByPk or transaction setup errors
    console.error(`Error deleting course ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus kursus.'
    });
  }
};
