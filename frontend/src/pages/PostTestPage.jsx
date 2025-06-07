import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Added Link
import api from '../services/api';
import { useCourseProgress } from '../contexts/CourseProgressContext'; // Import context

const PostTestPage = () => {
  const { identifier } = useParams(); // Changed courseId to identifier
  const navigate = useNavigate();
  const { 
    modules: contextModules, 
    fetchCourseProgressAndModules, 
    isLoading: progressContextIsLoading, 
    currentCourseId: contextCourseIdForProgress, // This is the numeric ID from context
    recordAndMarkTestAsCompleted, 
    getPostTestModule,
    fetchedByIdentifier // Added
  } = useCourseProgress();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({}); // { questionId: optionId }
  const [loading, setLoading] = useState(true); // For questions loading
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState(''); // Added for submission errors
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for submission state
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  // const [previousContentModule, setPreviousContentModule] = useState(null); // Replaced by useMemo

  useEffect(() => {
    // Fetch course progress if not already fetched for this identifier
    if (identifier && identifier !== fetchedByIdentifier) {
      fetchCourseProgressAndModules(identifier);
    }
  }, [identifier, fetchedByIdentifier, fetchCourseProgressAndModules]);
  
  const previousContentModule = useMemo(() => {
    if (!contextModules || contextModules.length === 0 || progressContextIsLoading) {
      return null;
    }
    // Ensure module types are consistent or cover all possibilities from backend/seed and frontend expectations
    const postTestModuleTypes = ['post_test', 'POST_TEST_QUIZ']; 
    const contentModuleTypes = ['PAGE', 'text', 'pdf', 'web', 'VIDEO', 'video'];

    const postTestModuleIndex = contextModules.findIndex(m => postTestModuleTypes.includes(m.type));

    if (postTestModuleIndex > 0) {
      for (let i = postTestModuleIndex - 1; i >= 0; i--) {
        const mod = contextModules[i];
        if (contentModuleTypes.includes(mod.type)) {
          return mod;
        }
      }
    }
    return null;
  }, [contextModules, progressContextIsLoading]);


  useEffect(() => {
    const fetchPostTestQuestions = async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch from the new post-test endpoint
        const response = await api.get(`/courses/${identifier}/post-test/questions`); // Changed courseId to identifier
        if (response.data && response.data.status === 'success') {
          const fetchedQuestions = response.data.data.questions || [];
          const processedQuestions = fetchedQuestions.map(q => {
            let optionsArray = q.options;
            if (typeof q.options === 'string') {
              try {
                optionsArray = JSON.parse(q.options);
              } catch (e) {
                console.error("Failed to parse options for question ID:", q.id, "Raw options:", q.options, e);
                optionsArray = []; // Default to empty array on parse error
              }
            }
            // Ensure it's an array even if parsing failed or it was null/undefined initially
            if (!Array.isArray(optionsArray)) {
                console.warn("Options for question ID:", q.id, "is not an array after processing. Raw options:", q.options, "Processed as:", optionsArray);
                optionsArray = [];
            }
            return { ...q, options: optionsArray };
          });
          setQuestions(processedQuestions);
          setCourseTitle(response.data.data.courseTitle || 'Post-Test');
          setModuleTitle(response.data.data.moduleTitle || '');
          if (processedQuestions.length === 0) {
            setError('Tidak ada soal post-test yang tersedia untuk kursus ini.');
          }
        } else {
          setError(response.data.message || 'Gagal mengambil soal post-test.');
        }
      } catch (err) {
        console.error("Error fetching post-test questions:", err);
        setError(err.response?.data?.message || 'Terjadi kesalahan server saat mengambil soal post-test.');
      } finally {
        setLoading(false);
      }
    };

    if (identifier) { // Changed courseId to identifier
      fetchPostTestQuestions();
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
  
  const handleSubmit = async () => { // Made async
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');

    // Basic scoring logic (can be expanded)
    let correctAnswers = 0; // Changed variable name for clarity
    const results = questions.map(q => {
        const selected = selectedOptions[q.id];
        const correct = selected === q.correctOptionId;
        if (correct) correctAnswers++;
        return {
            questionId: q.id,
            teksSoal: q.teksSoal,
            options: q.options,
            selectedOptionId: selected,
            correctOptionId: q.correctOptionId,
            isCorrect: correct
        };
    });
    
    const percentage = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

    const postTestModule = getPostTestModule();

    if (!postTestModule || !postTestModule.id) {
      setSubmitError('Tidak dapat menemukan modul post-test. Silakan coba lagi.');
      setIsSubmitting(false);
      return;
    }

    // Ensure the numeric course ID from context is available
    console.log("[PostTestPage] handleSubmit: Checking contextCourseIdForProgress. Value:", contextCourseIdForProgress);
    if (!contextCourseIdForProgress) {
      setSubmitError("Informasi kursus tidak lengkap. Tidak dapat mengirimkan hasil post-test. Silakan coba muat ulang halaman.");
      console.error("Numeric Course ID from context (contextCourseIdForProgress) is not available for post-test handleSubmit. Value:", contextCourseIdForProgress);
      setIsSubmitting(false);
      return;
    }

    try {
      // console.log(`Submitting score for module ${postTestModule.id}: ${percentage}`);
      await recordAndMarkTestAsCompleted(postTestModule.id, percentage);
      
      // Navigate to results page, passing state
      navigate(`/course/${identifier}/posttest-result`, {
          state: { 
              results, 
              score: correctAnswers, // Pass correctAnswers as score
              totalQuestions: questions.length,
              percentage,
              courseTitle,
              moduleTitle,
              postTestModuleId: postTestModule.id // Optionally pass module ID
          } 
      });
    } catch (err) {
      console.error("Error submitting post-test score:", err);
      setSubmitError(err.response?.data?.message || err.message || 'Gagal menyimpan skor post-test. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || progressContextIsLoading) { // Consider context loading state
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teraplus-accent"></div>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error || submitError}</div>;
  }

  if (questions.length === 0 && !loading && !progressContextIsLoading) { // Ensure not loading before showing this
    return <div className="container mx-auto px-4 py-8 text-center">Tidak ada soal post-test untuk ditampilkan.</div>;
  }
  
  // Ensure currentQuestion is available before rendering
  if (questions.length === 0 || !questions[currentQuestionIndex]) {
    // This case should ideally be covered by loading/error states,
    // but as a fallback:
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Memuat soal...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-6">
        <Link 
          to={`/course/${identifier}`} // Navigate to the main course detail page
          className="inline-flex items-center text-teraplus-accent hover:text-teraplus-hover focus:outline-none focus:ring-2 focus:ring-teraplus-accent-light rounded-md px-3 py-1 transition-colors duration-150"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Detail Kursus
        </Link>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-teraplus-text-default mb-2">
        {moduleTitle || `Post-Test: ${courseTitle}`}
      </h1>
      <p className="text-sm text-gray-500 mb-6">Soal {currentQuestionIndex + 1} dari {questions.length}</p>

      {submitError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
          {submitError}
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-teraplus-text-default mb-4">{currentQuestion.teksSoal}</h2>
        
        <div className="space-y-3 mb-6">
          {currentQuestion && Array.isArray(currentQuestion.options) && currentQuestion.options.map((option) => (
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
              if (currentQuestionIndex === 0 && previousContentModule) {
                // Navigate using the module's order to match the content route
                navigate(`/course/${identifier}/content/${previousContentModule.order}`); 
              } else {
                handlePrevious(); // Original handler for previous question
              }
            }}
            disabled={(currentQuestionIndex === 0 && !previousContentModule) || progressContextIsLoading || isSubmitting}
            className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            {currentQuestionIndex === 0 && previousContentModule ? 'Kembali ke Modul' : 'Sebelumnya'}
          </button>
          {currentQuestionIndex === questions.length - 1 ? (
             <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isSubmitting ? 'Mengumpulkan...' : 'Kumpulkan Jawaban'}
            </button>
          ) : (
            <button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1 || isSubmitting}
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

export default PostTestPage;
