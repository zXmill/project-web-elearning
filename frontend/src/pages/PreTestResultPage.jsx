import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

const PreTestResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  // Ensure all expected state properties are destructured, add moduleId if needed
  const { results, score, totalQuestions, percentage, courseTitle, moduleTitle, questions: allQuestions } = location.state || {};

  const PASSING_PERCENTAGE = 0; // Pre-test might not have a strict "passing" concept for progression

  if (!results || !allQuestions) {
    // Handle case where state is not passed (e.g., direct navigation)
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Hasil pre-test tidak tersedia. Silakan coba kerjakan pre-test terlebih dahulu.</p>
        <button 
            onClick={() => navigate(`/course/${courseId}/pretest`)} // Navigate back to pre-test
            className="mt-4 px-6 py-2 bg-teraplus-accent text-white rounded-lg hover:opacity-90"
        >
            Kembali ke Pre-Test
        </button>
      </div>
    );
  }

  // isPassed might not be relevant for pre-test, or used differently.
  // For now, we can keep the logic if we want to show a similar message.
  const isPassed = percentage >= PASSING_PERCENTAGE; 
  const date = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-teraplus-text-default">Hasil Pre-Test</h1>
            <p className="text-sm text-gray-500">{moduleTitle || courseTitle}</p>
          </div>
          <button 
            onClick={() => navigate(`/course/${courseId}/content`)} // Navigate to course content
            className="text-xl font-bold text-gray-400 hover:text-gray-600"
            title="Lanjutkan ke Materi Kursus"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-600">Tanggal Ujian: {date}</p>
            <p className="text-sm text-gray-600 mt-1">Total Soal: {totalQuestions}</p>
            <p className="text-2xl font-bold mt-2">Skor: {score} <span className="text-lg font-normal">/ {totalQuestions}</span> ({percentage.toFixed(0)}%)</p>
            {/* Informational message based on score, less about "passing" for pre-test */}
            <p className="mt-2 text-gray-700">
              Ini adalah skor awal Anda. Gunakan hasil ini untuk fokus pada area yang perlu ditingkatkan selama kursus.
            </p>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-teraplus-text-default mb-4">Rincian Jawaban:</h2>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {results.map((item, index) => {
                // Find the full question object to access its explanation, if available
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
                            ${opt.id === item.correctOptionId ? 'bg-green-100 border-l-4 border-green-500' : ''}
                            ${opt.id === item.selectedOptionId && opt.id !== item.correctOptionId ? 'bg-red-100 border-l-4 border-red-500' : ''}
                            ${opt.id === item.selectedOptionId ? 'font-semibold' : ''}
                          `}
                        >
                          <span className={`mr-2 w-5 h-5 flex items-center justify-center rounded-full border text-xs
                            ${opt.id === item.correctOptionId ? 'bg-green-500 text-white border-green-500' : 'border-gray-300'}
                            ${opt.id === item.selectedOptionId && opt.id !== item.correctOptionId ? 'bg-red-500 text-white border-red-500' : ''}
                          `}>
                            {String.fromCharCode(65 + item.options.indexOf(opt))} {/* A, B, C, D */}
                          </span>
                          <span>{opt.text}</span>
                          {opt.id === item.selectedOptionId && !item.isCorrect && (
                              <span className="ml-auto text-xs text-red-600">(Jawaban Anda)</span>
                          )}
                           {opt.id === item.correctOptionId && (
                              <span className="ml-auto text-xs text-green-600">(Jawaban Benar)</span>
                          )}
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
                onClick={() => navigate(`/course/${courseId}/content`)}
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
