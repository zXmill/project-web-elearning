const { Question, Module } = require('../models');

// Get all questions for a module
exports.getQuestions = async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    // Verify that the module exists and is a test type
    const module = await Module.findByPk(moduleId);
    if (!module) {
      return res.status(404).json({
        status: 'fail',
        message: 'Modul tidak ditemukan.'
      });
    }

    // Check if the module type is one that can have questions
    if (module.type !== 'PRE_TEST_QUIZ' && module.type !== 'POST_TEST_QUIZ') {
      return res.status(400).json({
        status: 'fail',
        message: 'Modul ini bukan tipe test dan tidak dapat memiliki pertanyaan.'
      });
    }

    const questions = await Question.findAll({
      where: { moduleId },
      order: [['id', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      results: questions.length,
      data: {
        questions
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil daftar pertanyaan.'
    });
  }
};

// Get a single question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params; // Or just 'id' if your route is /questions/:id
    const question = await Question.findByPk(questionId);

    if (!question) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pertanyaan tidak ditemukan.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        question
      }
    });
  } catch (error) {
    console.error(`Error fetching question ${req.params.questionId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil detail pertanyaan.'
    });
  }
};

// Create new question
exports.createQuestion = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const {
      teksSoal,
      type,
      options,
      correctOptionId,
      explanation
    } = req.body;

    // Validation
    if (!teksSoal || !type) {
      return res.status(400).json({
        status: 'fail',
        message: 'Teks soal dan tipe pertanyaan diperlukan.'
      });
    }

    // Validate question type
    if (!['mcq', 'upload'].includes(type)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tipe pertanyaan tidak valid.'
      });
    }

    // For MCQ type, validate options and correctOptionId
    if (type === 'mcq') {
      if (!options || !Array.isArray(JSON.parse(options))) {
        return res.status(400).json({
          status: 'fail',
          message: 'Opsi jawaban diperlukan untuk tipe MCQ.'
        });
      }

      const parsedOptions = JSON.parse(options);
      if (!correctOptionId || !parsedOptions.some(opt => opt.id === correctOptionId)) {
        return res.status(400).json({
          status: 'fail',
          message: 'ID opsi jawaban yang benar tidak valid.'
        });
      }
    }

    // Create question
    const question = await Question.create({
      moduleId,
      teksSoal,
      type,
      options: type === 'mcq' ? options : null,
      correctOptionId: type === 'mcq' ? correctOptionId : null,
      explanation
    });

    res.status(201).json({
      status: 'success',
      data: {
        question
      }
    });
  } catch (error) {
    console.error('Error creating question:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat pertanyaan baru.'
    });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      teksSoal,
      type,
      options,
      correctOptionId,
      explanation
    } = req.body;

    const question = await Question.findByPk(id);

    if (!question) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pertanyaan tidak ditemukan.'
      });
    }

    // If updating type to MCQ, validate options and correctOptionId
    if (type === 'mcq') {
      if (options) {
        try {
          const parsedOptions = JSON.parse(options);
          if (!Array.isArray(parsedOptions)) {
            throw new Error('Options must be an array');
          }
        } catch (e) {
          return res.status(400).json({
            status: 'fail',
            message: 'Format opsi jawaban tidak valid.'
          });
        }
      }

      if (correctOptionId && options) {
        const parsedOptions = JSON.parse(options);
        if (!parsedOptions.some(opt => opt.id === correctOptionId)) {
          return res.status(400).json({
            status: 'fail',
            message: 'ID opsi jawaban yang benar tidak valid.'
          });
        }
      }
    }

    // Update fields if provided
    if (teksSoal !== undefined) question.teksSoal = teksSoal;
    if (type !== undefined) question.type = type;
    if (options !== undefined) question.options = options;
    if (correctOptionId !== undefined) question.correctOptionId = correctOptionId;
    if (explanation !== undefined) question.explanation = explanation;

    await question.save();

    res.status(200).json({
      status: 'success',
      data: {
        question
      }
    });
  } catch (error) {
    console.error(`Error updating question ${req.params.id}:`, error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui pertanyaan.'
    });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id);

    if (!question) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pertanyaan tidak ditemukan.'
      });
    }

    await question.destroy();
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting question ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus pertanyaan.'
    });
  }
};

// Bulk create questions for a module
exports.bulkCreateQuestions = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Data pertanyaan harus berupa array.'
      });
    }

    // Verify module exists and is a test type
    const module = await Module.findByPk(moduleId);
    if (!module) {
      return res.status(404).json({
        status: 'fail',
        message: 'Modul tidak ditemukan.'
      });
    }

    // Check if the module type is one that can have questions
    if (module.type !== 'PRE_TEST_QUIZ' && module.type !== 'POST_TEST_QUIZ') {
      return res.status(400).json({
        status: 'fail',
        message: 'Modul ini bukan tipe test dan tidak dapat memiliki pertanyaan.'
      });
    }

    // Create all questions
    const createdQuestions = await Question.bulkCreate(
      questions.map(q => ({ ...q, moduleId }))
    );

    res.status(201).json({
      status: 'success',
      data: {
        questions: createdQuestions
      }
    });
  } catch (error) {
    console.error('Error bulk creating questions:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat pertanyaan secara massal.'
    });
  }
};
