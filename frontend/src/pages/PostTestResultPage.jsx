import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

const PostTestResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { results, score, totalQuestions, percentage, courseTitle, moduleTitle } = location.state || {};

  const PASSING_PERCENTAGE = 75; // Define a passing threshold

  if (!results) {
    // Handle case where state is not passed (e.g., direct navigation)
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Hasil tidak tersedia. Silakan coba kerjakan post-test terlebih dahulu.</p>
        <button 
            onClick={() => navigate(`/course/${courseId}`)}
            className="mt-4 px-6 py-2 bg-teraplus-accent text-white rounded-lg hover:opacity-90"
        >
            Kembali ke Detail Kursus
        </button>
      </div>
    );
  }

  const isPassed = percentage >= PASSING_PERCENTAGE;
  const date = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-teraplus-text-default">Hasil Post-Test</h1>
            <p className="text-sm text-gray-500">{moduleTitle || courseTitle}</p>
          </div>
          <button 
            onClick={() => navigate(`/course/${courseId}`)} // Or to a certificate page later
            className="text-xl font-bold text-gray-400 hover:text-gray-600"
            title="Tutup"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-600">Tanggal Ujian: {date}</p>
            <p className="text-sm text-gray-600 mt-1">Total Soal: {totalQuestions}</p>
            <p className="text-2xl font-bold mt-2">Skor: {score} <span className="text-lg font-normal">/ {totalQuestions}</span> ({percentage.toFixed(0)}%)</p>
            {isPassed ? (
              <p className="mt-2 text-green-600 font-semibold">Selamat! Anda telah memenuhi batas minimum kelulusan.</p>
            ) : (
              <p className="mt-2 text-red-600 font-semibold">
                Skor Anda belum memenuhi batas minimum ({PASSING_PERCENTAGE}%). Mohon pelajari kembali modul-modul terkait.
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-teraplus-text-default mb-4">Rincian Jawaban:</h2>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {results.map((item, index) => (
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
                  {!item.selectedOptionId && (
                    <p className="text-sm text-yellow-600 mt-1">Tidak dijawab.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {isPassed && (
            <div className="text-center mt-8">
                <button 
                    onClick={() => navigate(`/course/${courseId}/certificate`)} // Placeholder for certificate page
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Lihat Sertifikat (Segera Hadir)
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default PostTestResultPage;
