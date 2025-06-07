const { Module, Question, Course, sequelize } = require('../models'); // Added sequelize instance from models
const { Op } = require('sequelize'); // Op from sequelize library

// Get all modules for a specific course (admin view)
exports.getModulesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Kursus tidak ditemukan.' });
    }

    const modules = await Module.findAll({
      where: { courseId },
      include: [{
        model: Question,
        as: 'questions',
        attributes: ['id', 'teksSoal', 'type'] // Only fetch necessary question fields
      }],
      order: [['order', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      results: modules.length,
      data: {
        courseTitle: course.judul, // Add course title for context
        modules
      }
    });
  } catch (error) {
    console.error(`Error fetching modules for course ${req.params.courseId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil daftar modul.'
    });
  }
};


// Get a single module by its ID (admin view)
exports.getModuleById = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findByPk(moduleId, {
      include: [{
        model: Question,
        as: 'questions' // Include questions associated with the module
      }]
    });

    if (!module) {
      return res.status(404).json({
        status: 'fail',
        message: 'Modul tidak ditemukan.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        module
      }
    });
  } catch (error) {
    console.error(`Error fetching module ${moduleId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil detail modul.'
    });
  }
};

// Create new module
exports.createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      judul,
      type,
      contentText,
      // pdfPath will come from req.body.pdfPath (URL from separate upload) for PDF_DOCUMENT type
      // videoLink is legacy
      pdfPath, // Expecting this in req.body for PDF_DOCUMENT
      videoLink,
      order,
      initialContent // Expecting this in req.body for PAGE type
    } = req.body;

    // Validation
    if (!judul || !type) {
      return res.status(400).json({
        status: 'fail',
        message: 'Judul dan tipe modul diperlukan.'
      });
    }

    // Validate module type
    const validTypes = ['PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ', 'PDF_DOCUMENT']; // Added PDF_DOCUMENT
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        status: 'fail',
        message: `Tipe modul tidak valid. Harus salah satu dari: ${validTypes.join(', ')}`
      });
    }

    let moduleData = {
      courseId: parseInt(courseId, 10),
      judul,
      type,
      contentText: type !== 'PDF_DOCUMENT' ? (contentText || null) : null,
      initialContent: type === 'PAGE' ? (initialContent || null) : null,
      pageContent: null, // Explicitly nullify pageContent if initialContent is primary
      pdfPath: type === 'PDF_DOCUMENT' ? (pdfPath || null) : null,
      videoLink: type !== 'PDF_DOCUMENT' ? (videoLink || null) : null, // Keep legacy videoLink for non-PDF types if sent
      // order will be handled below
    };
    
    // If order is not provided, place at the end
    let moduleOrder = parseInt(order, 10);
    if (isNaN(moduleOrder)) {
      const lastModule = await Module.findOne({
        where: { courseId: parseInt(courseId, 10) },
        order: [['order', 'DESC']]
      });
      moduleOrder = lastModule ? lastModule.order + 1 : 1;
    }
    moduleData.order = moduleOrder;

    // Create module
    const module = await Module.create(moduleData);

    res.status(201).json({
      status: 'success',
      data: {
        module
      }
    });
  } catch (error) {
    console.error('Error creating module:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat modul baru.'
    });
  }
};

// Update module
exports.updateModule = async (req, res) => {
  console.log('Update Module Request Body:', req.body); 
  console.log('Update Module Request File:', req.file); // For debugging, to see if 'pdfFile' is still sent by multer
  try {
    const { moduleId } = req.params; 
    const {
      judul,
      type,
      contentText,
      pdfPath, // Expecting this in req.body for PDF_DOCUMENT
      videoLink,
      order,
      initialContent // Expecting this in req.body for PAGE type
    } = req.body;

    const module = await Module.findByPk(moduleId);

    if (!module) {
      return res.status(404).json({
        status: 'fail',
        message: 'Modul tidak ditemukan.'
      });
    }

    // Update fields if provided
    if (judul !== undefined) module.judul = judul;
    if (order !== undefined) module.order = parseInt(order, 10);

    let finalType = module.type;
    if (type !== undefined && module.type !== type) {
      const validTypes = ['PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ', 'PDF_DOCUMENT']; // Added PDF_DOCUMENT
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          status: 'fail',
          message: `Tipe modul tidak valid. Harus salah satu dari: ${validTypes.join(', ')}`
        });
      }
      module.type = type;
      finalType = type;
    }
    
    // Handle content fields based on the final type
    if (finalType === 'PDF_DOCUMENT') {
      module.pdfPath = pdfPath !== undefined ? pdfPath : module.pdfPath; // Update if provided, else keep existing
      module.initialContent = null;
      module.contentText = null;
      module.pageContent = null; 
      module.videoLink = null;
    } else if (finalType === 'PAGE') {
      module.initialContent = initialContent !== undefined ? initialContent : module.initialContent;
      module.contentText = contentText !== undefined ? contentText : module.contentText; // Can coexist or be instructions
      module.pageContent = null; // Explicitly nullify if initialContent is primary
      module.pdfPath = null;
      module.videoLink = videoLink !== undefined ? videoLink : module.videoLink; // Legacy
    } else { // PRE_TEST_QUIZ, POST_TEST_QUIZ
      module.contentText = contentText !== undefined ? contentText : module.contentText; // Usually for instructions
      module.initialContent = null;
      module.pageContent = null; // Quizzes don't use pageContent directly in module
      module.pdfPath = null;
      module.videoLink = null;
    }

    await module.save();

    res.status(200).json({
      status: 'success',
      data: {
        module
      }
    });
  } catch (error) {
    console.error(`Error updating module ${moduleId}:`, error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui modul.'
    });
  }
};

// Delete module
exports.deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params; // Changed from id to moduleId
    const module = await Module.findByPk(moduleId);

    if (!module) {
      return res.status(404).json({
        status: 'fail',
        message: 'Modul tidak ditemukan.'
      });
    }

    // Get the module's current order and courseId
    const { order: deletedOrder, courseId } = module;

    // Delete the module
    await module.destroy();

    // Reorder remaining modules
    await Module.update(
      { order: sequelize.literal('`order` - 1') },
      {
        where: {
          courseId,
          order: { [Op.gt]: deletedOrder }
        }
      }
    );

    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting module ${req.params.moduleId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus modul.'
    });
  }
};

// Reorder modules
exports.reorderModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(moduleOrders)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Format urutan modul tidak valid.'
      });
    }

    // Update each module's order
    await Promise.all(
      moduleOrders.map(({ id, order }) =>
        Module.update(
          { order },
          { where: { id, courseId } }
        )
      )
    );

    // Fetch updated modules
    const updatedModules = await Module.findAll({
      where: { courseId },
      order: [['order', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        modules: updatedModules
      }
    });
  } catch (error) {
    console.error('Error reordering modules:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengubah urutan modul.'
    });
  }
};
