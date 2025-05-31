import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { Document, Page, pdfjs } from 'react-pdf';
import api from '../services/api';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const CourseContentPage = () => {
  const { courseId, moduleId } = useParams(); // moduleId might be used later for specific module
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  // Placeholder for current module data
  const [currentModule, setCurrentModule] = useState(null); 
  // Placeholder for all modules of the course to handle progression
  const [modules, setModules] = useState([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  // PDF Viewer State
  const [numPages, setNumPages] = useState(null);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);


  useEffect(() => {
    const fetchCourseContentData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/courses/${courseId}/modules`);
        if (response.data && response.data.status === 'success') {
          setCourseTitle(response.data.data.courseTitle || `Course ${courseId}`);
          const fetchedModules = response.data.data.modules || [];
          setModules(fetchedModules);

          if (fetchedModules.length > 0) {
            // If moduleId is in params and valid, use it. Otherwise, default to first module.
            // This part can be enhanced if direct navigation to a specific module ID is needed.
            const initialModuleIndex = moduleId ? fetchedModules.findIndex(m => m.id.toString() === moduleId) : 0;
            const validInitialIndex = initialModuleIndex !== -1 ? initialModuleIndex : 0;
            
            setCurrentModuleIndex(validInitialIndex);
            setCurrentModule(fetchedModules[validInitialIndex]);
            setNumPages(null); // Reset PDF pages when module changes
            setCurrentPageNumber(1); // Reset to first page
          } else {
            setError("Tidak ada modul konten yang ditemukan untuk kursus ini.");
            setCurrentModule(null);
          }
        } else {
          setError(response.data.message || "Gagal mengambil data modul kursus.");
        }
      } catch (err) {
        console.error("Error fetching course content:", err);
        setError(err.response?.data?.message || "Terjadi kesalahan server saat memuat konten kursus.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseContentData();
    }
  }, [courseId, moduleId]); // Add moduleId to dependency array if used for direct navigation

  const handleNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      const newIndex = currentModuleIndex + 1;
      setCurrentModuleIndex(newIndex);
      setCurrentModule(modules[newIndex]);
      setNumPages(null); // Reset PDF pages
      setCurrentPageNumber(1); // Reset to first page
    } else {
      // Last content module, navigate to Post-Test
      navigate(`/course/${courseId}/posttest`);
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      const newIndex = currentModuleIndex - 1;
      setCurrentModuleIndex(newIndex);
      setCurrentModule(modules[newIndex]);
      setNumPages(null); // Reset PDF pages
      setCurrentPageNumber(1); // Reset to first page
    }
  };

  // PDF Pagination functions
  const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
    setCurrentPageNumber(1); // Reset to page 1 when new PDF loads
  };

  const goToPreviousPage = () => {
    setCurrentPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages));
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
  
  if (!currentModule) {
    return <div className="container mx-auto px-4 py-8 text-center">Modul tidak ditemukan atau kursus tidak memiliki konten.</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-teraplus-text-default mb-2">
        {courseTitle}
      </h1>
      <p className="text-sm text-gray-500 mb-6">Modul {currentModuleIndex + 1} dari {modules.length}: {currentModule.judul}</p>

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200 min-h-[400px]">
        {/* TODO: Render module content based on currentModule.type */}
        {currentModule.type === 'web' && currentModule.contentText && (
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-3">{currentModule.judul}</h2>
            <p>{currentModule.contentText}</p>
          </div>
        )}
        {currentModule.type === 'pdf' && (
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-3">{currentModule.judul}</h2>
            <div className="w-full min-h-[600px] bg-gray-100 rounded-lg overflow-hidden">
              <Document
                file={currentModule.pdfPath}
                loading={
                  <div className="flex justify-center items-center h-[600px]">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teraplus-accent"></div>
                  </div>
                }
                error={
                  <div className="flex justify-center items-center h-[600px] text-red-500">
                    Gagal memuat PDF. Pastikan file tersedia dan dalam format yang benar.
                  </div>
                }
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <Page
                  pageNumber={currentPageNumber}
                  width={Math.min(800, window.innerWidth - 48)} // Responsive width with padding
                  renderTextLayer={false} // Keep false for performance unless specified
                  renderAnnotationLayer={false} // Keep false for performance unless specified
                  loading={
                    <div className="flex justify-center items-center h-[400px]">
                      Memuat halaman...
                    </div>
                  }
                  error={
                    <div className="flex justify-center items-center h-[400px] text-red-500">
                      Gagal memuat halaman PDF.
                    </div>
                  }
                />
              </Document>
              {numPages && (
                <div className="mt-4 flex justify-center items-center space-x-4">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPageNumber <= 1}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <span>
                    Halaman {currentPageNumber} dari {numPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPageNumber >= numPages}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
         {currentModule.type === 'web' && currentModule.videoLink && (
           <div className="aspect-w-16 aspect-h-9"> {/* Responsive video container */}
            <YouTube
              videoId={currentModule.videoLink}
              opts={{
                height: '100%', // Make responsive, will be controlled by aspect ratio container
                width: '100%',  // Make responsive
                playerVars: {
                  // https://developers.google.com/youtube/player_parameters
                  autoplay: 0,
                  modestbranding: 1,
                  rel: 0, // Do not show related videos at the end
                },
              }}
              className="w-full h-full" // Ensure it fills the container
            />
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={handlePreviousModule}
          disabled={currentModuleIndex === 0}
          className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          Modul Sebelumnya
        </button>
        <button
          onClick={handleNextModule}
          className="w-full sm:w-auto px-6 py-3 bg-teraplus-accent text-white font-semibold rounded-lg hover:opacity-90 transition-colors"
        >
          {currentModuleIndex === modules.length - 1 ? 'Lanjut ke Post-Test' : 'Modul Selanjutnya'}
        </button>
      </div>
    </div>
  );
};

export default CourseContentPage;
