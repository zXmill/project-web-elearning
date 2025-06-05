import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { Document, Page, pdfjs } from 'react-pdf';
// import api from '../services/api'; // api calls will be through context or direct if needed
import { useCourseProgress } from '../contexts/CourseProgressContext';
import { useAuth } from '../contexts/AuthContext'; // To ensure user is available for progress

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const extractYouTubeID = (url) => {
  if (!url) return null;
  // Regular expression to find YouTube video ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const CourseContentPage = () => {
  const { courseId, moduleId: moduleIdFromParams } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    modules: contextModules,
    completedModuleIds,
    lastAccessedModuleId,
    isModuleCompleted,
    markModuleAsCompleted,
    fetchCourseProgressAndModules,
    isLoading: progressIsLoading,
    error: progressError,
    currentCourseId: contextCourseId,
    courseTitle: contextCourseTitle, // Get courseTitle from context
  } = useCourseProgress();

  const [currentModule, setCurrentModule] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(-1);
  // const [courseTitle, setCourseTitle] = useState(''); // REMOVED: Can be fetched or passed via state

  // PDF Viewer State
  const [numPages, setNumPages] = useState(null);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  
  // Local loading/error for this page specifically if needed, though context handles global
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');


  useEffect(() => {
    if (courseId && user && courseId !== contextCourseId) {
      // If context is for a different course, or not loaded yet for this course
      fetchCourseProgressAndModules(courseId);
    } else if (!user && courseId) {
      // Handle non-logged in user trying to access content - redirect or show message
      setPageError("Anda harus login untuk mengakses konten kursus.");
      setPageLoading(false);
      // Optionally navigate to login after a delay
      // setTimeout(() => navigate('/login'), 3000);
    }
  }, [courseId, user, contextCourseId, fetchCourseProgressAndModules]);


  useEffect(() => {
    if (progressIsLoading) {
      setPageLoading(true);
      return;
    }
    if (progressError) {
      setPageError(progressError);
      setPageLoading(false);
      return;
    }

    if (contextModules && contextModules.length > 0) {
      // setCourseTitle(`Course ${courseId}`); // REMOVED: Placeholder, ideally fetched with modules or course details

      let targetModule;
      let targetIndex = -1;

      if (moduleIdFromParams) {
        targetIndex = contextModules.findIndex(m => m.id.toString() === moduleIdFromParams);
        if (targetIndex !== -1) {
          targetModule = contextModules[targetIndex];
        } else {
          setPageError("Modul tidak ditemukan.");
          setPageLoading(false);
          return;
        }
      } else { // No moduleIdFromParams, this is the "Lanjutkan Kursus" or direct /content access
        let resumeModule = null;
        let resumeIndex = -1;

        // Helper to check if a module is a content module
        const isContentModuleType = (moduleType) => 
          moduleType === 'PAGE' || moduleType === 'pdf' || moduleType === 'web' || moduleType === 'VIDEO';

        // 1. Try to resume at lastAccessedModuleId if it's a content module
        if (lastAccessedModuleId) {
          const lastAccessedIdx = contextModules.findIndex(m => m.id.toString() === lastAccessedModuleId.toString());
          if (lastAccessedIdx !== -1) {
            const lastAccessedMod = contextModules[lastAccessedIdx];
            if (isContentModuleType(lastAccessedMod.type)) {
              resumeModule = lastAccessedMod; // Go to this module, completed or not
              resumeIndex = lastAccessedIdx;
            }
          }
        }

        // 2. If no suitable lastAccessedModuleId (not set, or not a content module), 
        //    find the first incomplete content module.
        if (!resumeModule) {
          for (let i = 0; i < contextModules.length; i++) {
            const mod = contextModules[i];
            if (isContentModuleType(mod.type) && !isModuleCompleted(mod.id)) {
              resumeModule = mod;
              resumeIndex = i;
              break;
            }
          }
        }
        
        // 3. If still no resumeModule (all content modules are completed, or no content modules to begin with,
        //    or lastAccessed was not content and no incomplete content modules were found),
        //    then, check for Pre-Test (if not done), then Post-Test.
        if (!resumeModule) {
          const preTestMod = contextModules.find(m => m.type === 'PRE_TEST_QUIZ');
          // Check if pre-test exists and is not completed
          if (preTestMod && !isModuleCompleted(preTestMod.id)) {
            // Prioritize incomplete pre-test if all content is done or no suitable resume point found yet
            resumeModule = preTestMod;
            resumeIndex = contextModules.findIndex(m => m.id === preTestMod.id);
          } else {
            // If pre-test is done or doesn't exist, or if we are past it, consider post-test
            const postTestMod = contextModules.find(m => m.type === 'POST_TEST_QUIZ');
            if (postTestMod) {
              resumeModule = postTestMod; // Go to post-test if it exists
              resumeIndex = contextModules.findIndex(m => m.id === postTestMod.id);
            } else if (contextModules.length > 0) { 
              // Fallback: No suitable content, no pre/post test, go to first module overall
              // This could happen if a course only has completed content modules and no tests.
              // Or if lastAccessedModuleId was a quiz that's now completed.
              // To be safe, try to find the *last* content module if all are complete.
              let lastContentModule = null;
              let lastContentIndex = -1;
              for (let i = contextModules.length - 1; i >= 0; i--) {
                  if (isContentModuleType(contextModules[i].type)) {
                      lastContentModule = contextModules[i];
                      lastContentIndex = i;
                      break;
                  }
              }
              if (lastContentModule) {
                  resumeModule = lastContentModule;
                  resumeIndex = lastContentIndex;
              } else { // Truly no content modules, or only quiz modules left (which should have been caught)
                  resumeModule = contextModules[0]; // Default to very first module
                  resumeIndex = 0;
              }
            } else {
              // No modules at all
              setPageError("Kursus ini tidak memiliki modul.");
            }
          }
        }
        
        targetModule = resumeModule;
        targetIndex = resumeIndex;
      }
      
      if (targetModule) {
        // Redirect to specific quiz pages if module type is a quiz
        if (targetModule.type === 'PRE_TEST_QUIZ') {
          navigate(`/course/${courseId}/pretest`);
          setPageLoading(false); // Prevent further state changes that might cause issues
          return; // Exit early from this effect
        }
        if (targetModule.type === 'POST_TEST_QUIZ') {
          navigate(`/course/${courseId}/posttest`);
          setPageLoading(false); // Prevent further state changes
          return; // Exit early from this effect
        }

        setCurrentModule(targetModule);
        setCurrentModuleIndex(targetIndex);
        setNumPages(null); 
        setCurrentPageNumber(1);

        // Mark as completed if it's a viewable type and not already completed
        if (targetModule.type === 'PAGE' || targetModule.type === 'pdf' || targetModule.type === 'web' || targetModule.type === 'VIDEO') {
          if (!isModuleCompleted(targetModule.id)) {
            markModuleAsCompleted(targetModule.id);
          }
        }
      } else {
         setPageError("Tidak ada modul yang dapat ditampilkan.");
      }
      setPageLoading(false);
    } else if (!progressIsLoading) { // No modules and not loading
      setPageError("Tidak ada modul konten yang ditemukan untuk kursus ini.");
      setCurrentModule(null);
      setPageLoading(false);
    }

  }, [
    moduleIdFromParams, 
    contextModules, 
    completedModuleIds, 
    lastAccessedModuleId, 
    isModuleCompleted, 
    markModuleAsCompleted, 
    progressIsLoading, 
    progressError,
    courseId, // Added courseId to re-evaluate if it changes
    navigate // Added navigate as a dependency
  ]);


  const handleNextModule = () => {
    if (currentModuleIndex < contextModules.length - 1) {
      const nextIndex = currentModuleIndex + 1;
      const nextModule = contextModules[nextIndex];
      // Navigate to the new module URL, which will trigger re-render and useEffects
      navigate(`/course/${courseId}/content/${nextModule.id}`);
    } else {
      // Last content module, navigate to Post-Test
      // Before navigating, ensure this last module is marked complete
      if (currentModule && !isModuleCompleted(currentModule.id) && (currentModule.type === 'PAGE' || currentModule.type === 'pdf' || currentModule.type === 'web')) {
        markModuleAsCompleted(currentModule.id);
      }
      navigate(`/course/${courseId}/posttest`);
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      const prevIndex = currentModuleIndex - 1;
      const prevModule = contextModules[prevIndex];
      navigate(`/course/${courseId}/content/${prevModule.id}`);
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


  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teraplus-accent"></div>
      </div>
    );
  }

  if (pageError) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{pageError}</div>;
  }
  
  if (!currentModule) {
    return <div className="container mx-auto px-4 py-8 text-center">Modul tidak ditemukan atau kursus tidak memiliki konten.</div>;
  }

  // Ensure contextModules is not undefined before accessing length
  const totalModulesInCourse = contextModules ? contextModules.length : 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-teraplus-text-default mb-2">
        {currentModule ? currentModule.judul : 'Memuat judul modul...'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Modul {currentModuleIndex + 1} dari {totalModulesInCourse} dalam kursus '{contextCourseTitle || 'Nama Kursus Tidak Diketahui'}'
      </p>

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200 min-h-[400px]">
        {currentModule.type === 'PAGE' && currentModule.initialContent && (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentModule.initialContent }} />
        )}
        {currentModule.type === 'PAGE' && !currentModule.initialContent && currentModule.contentText && (
          <div className="prose max-w-none">
            <p>{currentModule.contentText}</p>
          </div>
        )}
        {currentModule.type === 'pdf' && currentModule.pdfPath && (
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-3">{currentModule.judul}</h2>
            <div className="w-full min-h-[600px] bg-gray-100 rounded-lg overflow-hidden">
              <Document
                file={currentModule.pdfPath} // Make sure pdfPath is correct
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
         {(currentModule.type === 'web' || currentModule.type === 'video') && currentModule.videoLink && (
           <div className="aspect-w-16 aspect-h-9">
            <YouTube
              videoId={extractYouTubeID(currentModule.videoLink)} 
              opts={{
                height: '100%',
                width: '100%',
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

      <div className="mt-4 text-sm text-gray-500">
        {/* Display progress from context */}
        <div>Modul selesai: {completedModuleIds.size} / {totalModulesInCourse}</div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={handlePreviousModule}
          disabled={currentModuleIndex <= 0 || totalModulesInCourse === 0}
          className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          Modul Sebelumnya
        </button>
        <button
          onClick={handleNextModule}
          disabled={totalModulesInCourse === 0} // Disable if no modules
          className="w-full sm:w-auto px-6 py-3 bg-teraplus-accent text-white font-semibold rounded-lg hover:opacity-90 transition-colors"
        >
          {currentModuleIndex === totalModulesInCourse - 1 ? 'Lanjut ke Post-Test' : 'Modul Selanjutnya'}
        </button>
      </div>
    </div>
  );
};

export default CourseContentPage;
