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
      // pdfPath will come from req.file if uploaded
      videoLink,
      order
      // isPreTest, isPostTest, hasQuiz are not in the Module model directly
    } = req.body;

    // Validation
    if (!judul || !type) {
      return res.status(400).json({
        status: 'fail',
        message: 'Judul dan tipe modul diperlukan.'
      });
    }

    // Validate module type
    const validTypes = ['PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        status: 'fail',
        message: `Tipe modul tidak valid. Harus salah satu dari: ${validTypes.join(', ')}`
      });
    }

    // pdfPath and videoLink are legacy or will be part of pageContent for PAGE type.
    // For now, we primarily handle contentText and pageContent (which might be null from frontend initially)
    let pdfPathValue = null;
    let videoLinkValue = null;
    let pageContentValue = req.body.pageContent || null; // Expecting pageContent from body

    // If order is not provided, place at the end
    let moduleOrder = parseInt(order, 10);
    if (isNaN(moduleOrder)) {
      const lastModule = await Module.findOne({
        where: { courseId: parseInt(courseId, 10) },
        order: [['order', 'DESC']]
      });
      moduleOrder = lastModule ? lastModule.order + 1 : 1;
    }

    // Create module
    const module = await Module.create({
      courseId: parseInt(courseId, 10),
      judul,
      type,
      contentText: contentText || null, // contentText is used for description/instructions for all new types
      pageContent: pageContentValue,    // For PAGE type's structured content, or QUIZ questions later
      pdfPath: pdfPathValue,            // Nullify legacy field
      videoLink: videoLinkValue,        // Nullify legacy field
      order: moduleOrder
    });

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
  try {
    const { moduleId } = req.params; // Changed from id to moduleId for clarity
    const {
      judul,
      type,
      contentText,
      // pdfPath might come from req.file or req.body
      videoLink,
      order
      // isPreTest, isPostTest, hasQuiz are not in the Module model
    } = req.body;

    const module = await Module.findByPk(moduleId);

    if (!module) {
      return res.status(404).json({
        status: 'fail',
        message: 'Modul tidak ditemukan.'
      });
    }

    // Store original type to check if it changed
    const originalType = module.type;

    // Update fields if provided
    if (judul !== undefined) module.judul = judul;
    
    let typeChanged = false;
    if (type !== undefined && module.type !== type) {
      const validTypes = ['PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          status: 'fail',
          message: `Tipe modul tidak valid. Harus salah satu dari: ${validTypes.join(', ')}`
        });
      }
      module.type = type;
      typeChanged = true;
    }
    
    // Handle content fields based on the (potentially new) type
    const currentModuleType = module.type;

    if (contentText !== undefined) {
      module.contentText = contentText;
    }
    if (req.body.pageContent !== undefined) { // pageContent can be explicitly set to null
      module.pageContent = req.body.pageContent;
    }

    // If type changed to one of the new types, or if it's already a new type,
    // ensure legacy fields are nulled.
    if (typeChanged || ['PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ'].includes(currentModuleType)) {
      module.pdfPath = null;
      module.videoLink = null;
    }
    // Note: If the type was an old type and is NOT changing, and pdfPath/videoLink are sent,
    // this logic doesn't explicitly handle updating them.
    // However, the frontend is now only sending new types.
    // For robustness, if an old type somehow came through and was being updated (not changed),
    // one might add specific handling here, but it's less critical now.


    if (order !== undefined) module.order = parseInt(order, 10);

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
