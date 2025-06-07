import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Added Link
import api from '../services/api';
import { useCourseProgress } from '../contexts/CourseProgressContext'; // Import context

const PreTestPage = () => {
  const { identifier } = useParams(); // Changed courseId to identifier
  const navigate = useNavigate();
  const { 
    modules: contextModules, 
    fetchCourseProgressAndModules, 
    isLoading: progressContextIsLoading, 
    currentCourseId: contextCourseIdForProgress, // This is the numeric ID from context
    recordAndMarkTestAsCompleted, // Get this from context
    fetchedByIdentifier // Get this from context
  } = useCourseProgress();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({}); // Store user's answers { questionId: optionId }
  const [loading, setLoading] = useState(true); // For questions loading
  const [error, setError] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [preTestModuleId, setPreTestModuleId] = useState(null); 

  useEffect(() => {
    // Fetch course progress if not already fetched for this identifier
    if (identifier && identifier !== fetchedByIdentifier) {
      fetchCourseProgressAndModules(identifier);
    }
  }, [identifier, fetchedByIdentifier, fetchCourseProgressAndModules]);

  const navigationTargetForBackButton = useMemo(() => {
    if (!contextModules || contextModules.length === 0 || progressContextIsLoading) {
      return null; 
    }
    const preTestModuleTypes = ['pre_test', 'PRE_TEST_QUIZ']; 
    const contentModuleTypes = ['PAGE', 'text', 'pdf', 'web', 'VIDEO', 'video'];

    const preTestModuleIndex = contextModules.findIndex(m => preTestModuleTypes.includes(m.type));

    if (preTestModuleIndex === -1) { 
      return { type: 'course_detail' }; // Fallback if pre-test module itself isn't found in context (shouldn't happen)
    }

    if (preTestModuleIndex > 0) {
      for (let i = preTestModuleIndex - 1; i >= 0; i--) {
        const mod = contextModules[i];
        if (contentModuleTypes.includes(mod.type)) {
          return { type: 'module', data: mod };
        }
      }
      return { type: 'course_detail' }; // No preceding content module found
    } else {
      return { type: 'course_detail' }; // Pre-test is the first module
    }
  }, [contextModules, progressContextIsLoading]);

  useEffect(() => {
    const fetchPreTestQuestions = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/courses/${identifier}/pre-test/questions`); // Changed courseId to identifier
        if (response.data && response.data.status === 'success') {
          const fetchedQuestions = response.data.data.questions || [];
          const parsedQuestions = fetchedQuestions.map(q => {
            try {
              return {
                ...q,
                options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options || []
              };
            } catch (parseError) {
              console.error("Failed to parse options for question:", q.id, parseError);
              return { ...q, options: [] }; // Fallback to empty options on parse error
            }
          });
          setQuestions(parsedQuestions);
          setCourseTitle(response.data.data.courseTitle || 'Pre-Test');
          setModuleTitle(response.data.data.moduleTitle || '');
          setPreTestModuleId(response.data.data.moduleId || null); // Store moduleId
          if (parsedQuestions.length === 0) {
            setError('Tidak ada soal pre-test yang tersedia untuk kursus ini.');
          }
        } else {
          setError(response.data.message || 'Gagal mengambil soal pre-test.');
        }
      } catch (err) {
        console.error("Error fetching pre-test questions:", err);
        setError(err.response?.data?.message || 'Terjadi kesalahan server saat mengambil soal.');
      } finally {
        setLoading(false);
      }
    };

    if (identifier) { // Changed courseId to identifier
      fetchPreTestQuestions();
    }
  }, [identifier]); // Changed courseId to identifier

  const handleOptionChange = (questionId, optionId) => {
    setSelectedOptions(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  
  const handleSubmit = async () => {
    if (!preTestModuleId) {
      setError("Module ID untuk pre-test tidak ditemukan. Tidak dapat mengirimkan hasil.");
      console.error("Pre-test module ID is not set.");
      return;
    }

    // Ensure the numeric course ID from context is available
    if (!contextCourseIdForProgress) {
      setError("Informasi kursus tidak lengkap. Tidak dapat mengirimkan hasil. Silakan coba muat ulang halaman.");
      console.error("Numeric Course ID from context (contextCourseIdForProgress) is not available for handleSubmit.");
      return;
    }

    let correctAnswersCount = 0;
    const resultsForReview = questions.map(q => {
      const selectedOptId = selectedOptions[q.id];
      const isCorrect = selectedOptId === q.correctOptionId;
      if (isCorrect) {
        correctAnswersCount++;
      }
      return {
        questionId: q.id,
        teksSoal: q.teksSoal,
        options: q.options, // these are already parsed
        selectedOptionId: selectedOptId,
        correctOptionId: q.correctOptionId,
        isCorrect: isCorrect,
        explanation: q.explanation || null // Pass explanation if available
      };
    });

    const percentage = questions.length > 0 ? (correctAnswersCount / questions.length) * 100 : 0;

    try {
      // Use the context function which internally uses the numeric currentCourseId
      await recordAndMarkTestAsCompleted(preTestModuleId, percentage);
      
      // Navigate to the result page
      navigate(`/course/${identifier}/pretest-result`, {
        state: { 
          results: resultsForReview, 
          score: correctAnswersCount, 
          totalQuestions: questions.length, 
          percentage,
          courseTitle,
          moduleTitle,
          questions: questions // Pass all original questions for full details like explanation
        } 
      });

    } catch (err) {
      console.error("Error submitting pre-test results:", err);
      setError(err.response?.data?.message || 'Gagal mengirimkan hasil pre-test.');
      // Optionally, still allow navigation to review page even if API fails, or handle differently
      // For now, we'll show an error and not navigate if API fails.
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teraplus-accent"></div>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="container mx-auto px-4 py-8 text-center">Tidak ada soal pre-test untuk ditampilkan.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-6">
        <Link 
          to={`/courses/${identifier}/moduleslist`} // Changed courseId to identifier
          className="inline-flex items-center text-teraplus-accent hover:text-teraplus-hover focus:outline-none focus:ring-2 focus:ring-teraplus-accent-light rounded-md px-3 py-1 transition-colors duration-150"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Daftar Modul
        </Link>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-teraplus-text-default mb-2">
        {moduleTitle || `Pre-Test: ${courseTitle}`}
      </h1>
      <p className="text-sm text-gray-500 mb-6">Soal {currentQuestionIndex + 1} dari {questions.length}</p>

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-teraplus-text-default mb-4">{currentQuestion.teksSoal}</h2>
        
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option) => (
            <label key={option.id} className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option.id}
                checked={selectedOptions[currentQuestion.id] === option.id}
                onChange={() => handleOptionChange(currentQuestion.id, option.id)}
                className="form-radio h-5 w-5 text-teraplus-accent focus:ring-teraplus-accent"
              />
              <span className="ml-3 text-teraplus-text-variant">{option.text}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={() => {
              if (currentQuestionIndex === 0 && navigationTargetForBackButton) {
                if (navigationTargetForBackButton.type === 'module' && navigationTargetForBackButton.data) {
                  // Find the 0-based index of this module in contextModules
                  const moduleIndex = contextModules.findIndex(m => m.id === navigationTargetForBackButton.data.id);
                  if (moduleIndex !== -1) {
                    // Navigate using 1-based order
                    navigate(`/course/${identifier}/content/${moduleIndex + 1}`);
                  } else {
                    // Fallback if module not found in context (should not happen if logic is correct)
                    navigate(`/course/${identifier}`); 
                  }
                } else { // type === 'course_detail' or data is missing
                  navigate(`/course/${identifier}`); 
                }
              } else {
                handlePrevious(); // Original handler for previous question
              }
            }}
            disabled={(currentQuestionIndex === 0 && !navigationTargetForBackButton) || progressContextIsLoading}
            className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            {currentQuestionIndex === 0 && navigationTargetForBackButton ? 
              (navigationTargetForBackButton.type === 'module' ? 'Kembali ke Modul' : 'Kembali ke Detail Kursus') : 
              'Sebelumnya'}
          </button>
          {currentQuestionIndex === questions.length - 1 ? (
             <button
                onClick={handleSubmit}
                disabled={Object.keys(selectedOptions).length !== questions.length}
                className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Kumpulkan
            </button>
          ) : (
            <button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="w-full sm:w-auto px-6 py-3 bg-teraplus-accent text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
            >
                Selanjutnya
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreTestPage;
