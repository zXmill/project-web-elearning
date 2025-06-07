import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useCourseProgress } from '../contexts/CourseProgressContext';

const PreTestResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identifier } = useParams(); // Changed courseId to identifier
  const { 
    markModuleAsCompleted, 
    modules: contextModules,
    fetchCourseProgressAndModules, 
    currentCourseId,
    isModuleCompleted,
    getPreTestModule 
  } = useCourseProgress();

  const [markingError, setMarkingError] = useState('');

  const { results, score, totalQuestions, percentage, courseTitle, moduleTitle, questions: allQuestions } = location.state || {};

  useEffect(() => {
    // Compare identifier with stringified currentCourseId from context (which should be numeric)
    if (identifier && (!contextModules || contextModules.length === 0 || identifier !== String(currentCourseId))) {
      fetchCourseProgressAndModules(identifier); // Use identifier for fetching
    }
  }, [identifier, contextModules, currentCourseId, fetchCourseProgressAndModules]); // Use identifier in dependencies

  useEffect(() => {
    const markPreTestAsDone = async () => {
      if (results && contextModules && contextModules.length > 0) {
        const preTestModule = getPreTestModule(); 

        if (preTestModule && !isModuleCompleted(preTestModule.id)) {
          try {
            setMarkingError(''); 
            await markModuleAsCompleted(preTestModule.id);
          } catch (error) {
            console.error('Error marking pre-test as completed:', error);
            setMarkingError('Terjadi kesalahan saat menyimpan progres pre-test Anda. Anda tetap dapat melanjutkan.');
          }
        }
      }
    };

    markPreTestAsDone();
  }, [results, contextModules, getPreTestModule, isModuleCompleted, markModuleAsCompleted, identifier]); // Use identifier in dependencies

  if (!results || !allQuestions) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Hasil pre-test tidak tersedia. Silakan coba kerjakan pre-test terlebih dahulu.</p>
        <button 
            onClick={() => navigate(`/course/${identifier}/pretest`)} // Use identifier
            className="mt-4 px-6 py-2 bg-teraplus-accent text-white rounded-lg hover:opacity-90"
        >
            Kembali ke Pre-Test
        </button>
      </div>
    );
  }

  const date = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

  const handleContinueToMaterial = () => {
    if (!contextModules || contextModules.length === 0) {
      navigate(`/course/${identifier}`); // Fallback to course detail - Use identifier
      return;
    }
  
  
    const preTestModule = getPreTestModule();
    let startIndex = 0;
    if (preTestModule) {
      const preTestIndex = contextModules.findIndex(m => m.id === preTestModule.id);
      if (preTestIndex !== -1) {
        startIndex = preTestIndex + 1;
      }
    }
  
    let firstActualContentModuleOrder = -1; // This will be 1-based order for URL

    for (let i = startIndex; i < contextModules.length; i++) {
      const module = contextModules[i];
      // Consistent content types with CourseContentPage
      if (['PAGE', 'pdf', 'web', 'VIDEO', 'text', 'video'].includes(module.type)) {
        firstActualContentModuleOrder = i + 1; // The order is the 0-based index + 1
        break;
      }
    }
  
    if (firstActualContentModuleOrder !== -1) {
      navigate(`/course/${identifier}/content/${firstActualContentModuleOrder}`); 
    } else {
      // If no typical content module is found next, try to find a post-test
      // Consistent check with CourseContentPage (includes lowercase variants)
      const postTestModule = contextModules.find(m => m.type === 'POST_TEST_QUIZ' || m.type === 'post_test');
      if (postTestModule) {
        navigate(`/course/${identifier}/posttest`); 
      } else {
        // Fallback to course detail page if no content or post-test
        navigate(`/course/${identifier}`); 
      }
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-teraplus-text-default">Hasil Pre-Test</h1>
            <p className="text-sm text-gray-500">{moduleTitle || courseTitle || `Kursus ${identifier}`}</p> 
          </div>
          <button 
            onClick={() => navigate(`/course/${identifier}/content`)} // Use identifier
            className="text-xl font-bold text-gray-400 hover:text-gray-600"
            title="Lanjutkan ke Materi Kursus"
          >
            &times;
          </button>
        </div>

        {markingError && (
          <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p>{markingError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-600">Tanggal Ujian: {date}</p>
            <p className="text-sm text-gray-600 mt-1">Total Soal: {totalQuestions}</p>
            <p className="text-2xl font-bold mt-2">Skor: {score} <span className="text-lg font-normal">/ {totalQuestions}</span> ({percentage !== undefined && percentage !== null ? percentage.toFixed(0) : 0}%)</p>
            <p className="mt-2 text-gray-700">
              Ini adalah skor awal Anda. Gunakan hasil ini untuk fokus pada area yang perlu ditingkatkan selama kursus.
            </p>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-teraplus-text-default mb-4">Rincian Jawaban:</h2>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {results.map((item, index) => {
                const questionDetail = allQuestions.find(q => q.id === item.questionId);
                const explanation = questionDetail ? questionDetail.explanation : null;

                return (
                  <div key={item.questionId} className="pb-4 border-b last:border-b-0">
                    <p className="font-semibold text-teraplus-text-variant mb-2">
                      {index + 1}. {item.teksSoal}
                    </p>
                    <div className="space-y-1">
                      {item.options.map(opt => (
                        <div 
                          key={opt.id} 
                          className={`p-2 rounded flex items-center
                            ${opt.id === item.selectedOptionId && item.isCorrect ? 'bg-green-100 border-l-4 border-green-500' : ''}
                            ${opt.id === item.selectedOptionId && !item.isCorrect ? 'bg-red-100 border-l-4 border-red-500' : ''}
                            ${opt.id === item.selectedOptionId ? 'font-semibold' : ''}
                          `}
                        >
                          <span className={`mr-2 w-5 h-5 flex items-center justify-center rounded-full border text-xs
                            ${opt.id === item.selectedOptionId && item.isCorrect ? 'bg-green-500 text-white border-green-500' : ''}
                            ${opt.id === item.selectedOptionId && !item.isCorrect ? 'bg-red-500 text-white border-red-500' : 'border-gray-300'}
                          `}>
                            {String.fromCharCode(65 + item.options.indexOf(opt))}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                    {explanation && (
                      <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-700">
                        <strong>Penjelasan:</strong> {explanation}
                      </div>
                    )}
                    {!item.selectedOptionId && (
                      <p className="text-sm text-yellow-600 mt-1">Tidak dijawab.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
            <button 
                onClick={handleContinueToMaterial}
                className="px-8 py-3 bg-teraplus-accent text-white font-semibold rounded-lg hover:opacity-90 transition-colors"
            >
                Lanjutkan ke Materi Kursus
            </button>
        </div>

      </div>
    </div>
  );
};

export default PreTestResultPage;
