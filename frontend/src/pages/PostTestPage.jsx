import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const PostTestPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({}); // { questionId: optionId }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');

  useEffect(() => {
    const fetchPostTestQuestions = async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch from the new post-test endpoint
        const response = await api.get(`/courses/${courseId}/post-test/questions`); 
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

    if (courseId) {
      fetchPostTestQuestions();
    }
  }, [courseId]);

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
  
  const handleSubmit = () => {
    // Basic scoring logic (can be expanded)
    let score = 0;
    const results = questions.map(q => {
        const selected = selectedOptions[q.id];
        const correct = selected === q.correctOptionId;
        if (correct) score++;
        return {
            questionId: q.id,
            teksSoal: q.teksSoal,
            options: q.options,
            selectedOptionId: selected,
            correctOptionId: q.correctOptionId,
            isCorrect: correct
        };
    });
    
    const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;

    // Navigate to results page, passing state
    navigate(`/course/${courseId}/posttest-result`, { 
        state: { 
            results, 
            score, 
            totalQuestions: questions.length,
            percentage,
            courseTitle,
            moduleTitle
        } 
    });
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
    return <div className="container mx-auto px-4 py-8 text-center">Tidak ada soal post-test untuk ditampilkan.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-teraplus-text-default mb-2">
        {moduleTitle || `Post-Test: ${courseTitle}`}
      </h1>
      <p className="text-sm text-gray-500 mb-6">Soal {currentQuestionIndex + 1} dari {questions.length}</p>

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
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Sebelumnya
          </button>
          {currentQuestionIndex === questions.length - 1 ? (
             <button
                onClick={handleSubmit}
                className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
            >
                Kumpulkan Jawaban
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

export default PostTestPage;
