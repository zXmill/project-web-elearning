import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom'; // Added Link
import { useCourseProgress } from '../contexts/CourseProgressContext';
import { useAuth } from '../contexts/AuthContext'; // To get user's name for certificate

const PostTestResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identifier } = useParams(); // Changed courseId to identifier
  const { user } = useAuth(); // Get user from AuthContext

  const {
    // markModuleAsCompleted, // No longer directly used for post-test submission
    recordAndMarkTestAsCompleted, // New function to record score
    modules: contextModules,
    fetchCourseProgressAndModules,
    currentCourseId,
    isModuleCompleted,
    getPostTestModule
  } = useCourseProgress();

  const [markingError, setMarkingError] = useState('');
  
  // Destructure state from location, providing default empty object
  const { 
    results, 
    score, 
    totalQuestions, 
    percentage, 
    courseTitle = 'Nama Kursus Tidak Tersedia', // Provide default for courseTitle
    moduleTitle, // moduleTitle might be undefined, handle appropriately
    questions: allQuestions // Added for consistency, though not directly used in this version of PostTestResultPage for display logic like PreTest
  } = location.state || {};

  const PASSING_PERCENTAGE = 76; // Define a passing threshold

  // Effect to ensure context has modules for the current course
  useEffect(() => {
    if (identifier && (!contextModules || contextModules.length === 0 || identifier !== String(currentCourseId))) { // Compare identifier with stringified currentCourseId
      fetchCourseProgressAndModules(identifier); // Use identifier
    }
  }, [identifier, contextModules, currentCourseId, fetchCourseProgressAndModules]); // Use identifier

  const isPassed = percentage !== undefined && percentage >= PASSING_PERCENTAGE;

  // Effect to record post-test score and mark as completed if passed
  useEffect(() => {
    const recordPostTestScoreAndMarkDone = async () => {
      // Ensure results, contextModules are loaded, and the test is passed
      if (results && contextModules && contextModules.length > 0 && isPassed && percentage !== undefined) {
        const postTestModule = getPostTestModule();

        // Check if the module exists and hasn't been marked as completed yet (or if we want to allow re-submission logic)
        // For now, assume we only mark/record if not already marked completed by this context's state.
        // The backend's recordTestScore will handle overwriting score if it's a re-attempt.
        if (postTestModule && !isModuleCompleted(postTestModule.id)) {
          try {
            setMarkingError('');
            // Use the new function, passing the percentage as the score (assuming score is 0-100)
            await recordAndMarkTestAsCompleted(postTestModule.id, percentage);
            // console.log(`Post-test module ${postTestModule.id} score ${percentage} recorded and marked as completed.`);
          } catch (error) {
            console.error('Error recording post-test score in Page:', error);
            // Extract message from error object, prioritizing backend's response message
            const backendMessage = error.response?.data?.message;
            const genericMessage = 'Terjadi kesalahan saat menyimpan progres post-test Anda. Sertifikat mungkin belum tersedia.';
            setMarkingError(backendMessage || (error.message || genericMessage));
          }
        } else if (postTestModule && isModuleCompleted(postTestModule.id)) {
          // console.log("Post-test module already marked as completed. Score might have been recorded previously.");
          // Optionally, if re-submission of score is allowed and desired, call recordAndMarkTestAsCompleted again.
          // For now, if already completed by context, assume it's fine.
        }
      }
    };

    recordPostTestScoreAndMarkDone();
  }, [results, contextModules, getPostTestModule, isModuleCompleted, recordAndMarkTestAsCompleted, identifier, isPassed, percentage]); // Use identifier

  if (!results) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Hasil post-test tidak tersedia. Silakan coba kerjakan post-test terlebih dahulu.</p>
        <button 
            onClick={() => navigate(`/course/${identifier}`)} // Use identifier
            className="mt-4 px-6 py-2 bg-teraplus-accent text-white rounded-lg hover:opacity-90"
        >
            Kembali ke Detail Kursus
        </button>
      </div>
    );
  }

  const date = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
  const studentName = user ? (user.name || user.username || 'Nama Peserta') : 'Nama Peserta';


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-6">
        <Link 
          to={`/course/${identifier}`} // Use identifier
          className="inline-flex items-center text-teraplus-accent hover:text-teraplus-hover focus:outline-none focus:ring-2 focus:ring-teraplus-accent-light rounded-md px-3 py-1 transition-colors duration-150"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Detail Kursus
        </Link>
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-teraplus-text-default">Hasil Post-Test</h1>
            <p className="text-sm text-gray-500">{moduleTitle || courseTitle}</p>
          </div>
          <button 
            onClick={() => navigate(`/course/${identifier}`)} // Use identifier
            className="text-xl font-bold text-gray-400 hover:text-gray-600"
            title="Tutup"
          >
            &times;
          </button>
        </div>

        {markingError && (
          <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p>{markingError}</p>
          </div>
        )}

        {isPassed && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
            <form
              action={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/certificates`}
              method="POST"
              target="_blank" // Opens in new tab
              className="inline"
            >
              <input type="hidden" name="name" value={studentName} />
              <input type="hidden" name="courseTitle" value={courseTitle} />
              {/* Backend certificate generation expects a numeric courseId. 
                  Using currentCourseId from context which should be the numeric ID.
                  Fallback to identifier if currentCourseId is somehow not yet populated,
                  though ideally it should be by this stage.
              */}
              <input type="hidden" name="courseId" value={currentCourseId || identifier} /> 
              <input type="hidden" name="userId" value={user ? user.id : ''} />
               <input type="hidden" name="completionDate" value={new Date().toISOString().split('T')[0]} />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm sm:text-base"
              >
                Unduh Sertifikat (.PDF)
              </button>
            </form>
            <button 
                onClick={() => navigate(`/course/${identifier}/certificate`)} // Use identifier
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
                Lihat Halaman Sertifikat
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-600">Tanggal Ujian: {date}</p>
            <p className="text-sm text-gray-600 mt-1">Total Soal: {totalQuestions}</p>
            <p className="text-2xl font-bold mt-2">Skor: {score} <span className="text-lg font-normal">/ {totalQuestions}</span> ({percentage !== undefined && percentage !== null ? percentage.toFixed(0) : 0}%)</p>
            {isPassed ? (
              <p className="mt-2 text-green-600 font-semibold">Selamat! Anda telah memenuhi batas minimum kelulusan.</p>
            ) : (
              <p className="mt-2 text-red-600 font-semibold">
                Skor Anda belum memenuhi batas minimum ({PASSING_PERCENTAGE}%). Mohon pelajari kembali modul-modul terkait dan coba lagi post-test jika diizinkan.
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-teraplus-text-default mb-4">Rincian Jawaban:</h2>
            {allQuestions && results ? (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {results.map((item, index) => {
                  const questionDetail = allQuestions.find(q => q.id === item.questionId);
                  const explanation = questionDetail ? questionDetail.explanation : null;

                  return (
                    <div key={item.questionId} className="pb-4 border-b last:border-b-0">
                      <p className="font-semibold text-teraplus-text-variant mb-2">
                        {index + 1}. {item.teksSoal || (questionDetail ? questionDetail.teksSoal : 'Teks soal tidak tersedia')}
                      </p>
                      <div className="space-y-1">
                        {(item.options || (questionDetail ? questionDetail.options : [])).map(opt => (
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
                              {String.fromCharCode(65 + (item.options || (questionDetail ? questionDetail.options : [])).indexOf(opt))}
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
            ) : (
              <p>Rincian jawaban tidak tersedia.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostTestResultPage;
