import React, { useState, useEffect } from 'react'; // Removed useMemo as it's not directly used after refactor
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const { identifier, moduleOrder: moduleOrderFromParams } = useParams();
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
    currentCourseId: contextCourseId, // Numeric ID from context
    courseTitle: contextCourseTitle, // Get courseTitle from context
    fetchedByIdentifier // Identifier used for the last successful fetch in context
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
    // Fetch if the context hasn't been loaded with the current URL identifier
    if (identifier && user && identifier !== fetchedByIdentifier) {
      fetchCourseProgressAndModules(identifier);
    } else if (!user && identifier) {
      setPageError("Anda harus login untuk mengakses konten kursus.");
      setPageLoading(false);
    }
  }, [identifier, user, fetchedByIdentifier, fetchCourseProgressAndModules]);


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

    const CONTENT_MODULE_TYPES = ['PAGE', 'pdf', 'web', 'VIDEO', 'text', 'video']; // Added lowercase variants
    const ALL_NAVIGABLE_MODULE_TYPES = [...CONTENT_MODULE_TYPES, 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ', 'pre_test', 'post_test'];


    if (contextModules && contextModules.length > 0) {
      setPageError(''); // Clear any previous page error if modules are now available
      let targetModule = null;
      let targetIndex = -1; // 0-based index

      if (moduleOrderFromParams) {
        const order = parseInt(moduleOrderFromParams, 10);
        if (isNaN(order) || order < 1 || order > contextModules.length) {
          setPageError("Urutan modul tidak valid.");
          setPageLoading(false);
          return;
        }
        targetIndex = order - 1; // Convert 1-based order to 0-based index
        targetModule = contextModules[targetIndex];
        
        if (!targetModule) { // Should not happen if order is within bounds
          setPageError("Modul dengan urutan tersebut tidak ditemukan.");
          setPageLoading(false);
          return;
        }
        // If the target module from order is a pre/post test, redirect immediately
        if (targetModule.type === 'PRE_TEST_QUIZ' || targetModule.type === 'pre_test') {
            navigate(`/course/${identifier}/pretest`, { replace: true });
            setPageLoading(false);
            return;
        }
        if (targetModule.type === 'POST_TEST_QUIZ' || targetModule.type === 'post_test') {
            navigate(`/course/${identifier}/posttest`, { replace: true });
            setPageLoading(false);
            return;
        }

      } else { // No moduleOrderFromParams, user hit /course/:identifier/content
        let resumeModuleCandidate = null;
        let resumeModuleOrderForNav = -1; // 1-based order for navigation

        // 1. Try last accessed content module
        if (lastAccessedModuleId) {
          const lastAccessedModIndex = contextModules.findIndex(m => m.id.toString() === lastAccessedModuleId.toString());
          if (lastAccessedModIndex !== -1) {
            const lastAccessedMod = contextModules[lastAccessedModIndex];
            if (lastAccessedMod && CONTENT_MODULE_TYPES.includes(lastAccessedMod.type)) {
              resumeModuleCandidate = lastAccessedMod;
              resumeModuleOrderForNav = lastAccessedModIndex + 1;
            }
          }
        }

        // 2. Try first uncompleted content module
        if (!resumeModuleCandidate) {
          for (let i = 0; i < contextModules.length; i++) {
            const mod = contextModules[i];
            if (CONTENT_MODULE_TYPES.includes(mod.type) && !isModuleCompleted(mod.id)) {
              resumeModuleCandidate = mod;
              resumeModuleOrderForNav = i + 1;
              break;
            }
          }
        }
        
        // 3. Try Pre-Test (if not completed) - this will navigate away from content page
        if (!resumeModuleCandidate) {
          const preTestModIndex = contextModules.findIndex(m => (m.type === 'PRE_TEST_QUIZ' || m.type === 'pre_test') && !isModuleCompleted(m.id));
          if (preTestModIndex !== -1) {
            navigate(`/course/${identifier}/pretest`, { replace: true });
            setPageLoading(false); return;
          }
        }

        // 4. Try Post-Test (even if completed, as it's a valid navigation point) - this will navigate away
        if (!resumeModuleCandidate) {
          const postTestModIndex = contextModules.findIndex(m => m.type === 'POST_TEST_QUIZ' || m.type === 'post_test');
          if (postTestModIndex !== -1) {
             navigate(`/course/${identifier}/posttest`, { replace: true });
             setPageLoading(false); return;
          }
        }
        
        // 5. If all content modules are completed, try the last content module
        if (!resumeModuleCandidate) { 
          for (let i = contextModules.length - 1; i >= 0; i--) {
            if (CONTENT_MODULE_TYPES.includes(contextModules[i].type)) {
              resumeModuleCandidate = contextModules[i];
              resumeModuleOrderForNav = i + 1;
              break;
            }
          }
        }

        // 6. Fallback to the very first content module if any other logic fails
        if (!resumeModuleCandidate) { 
            const firstContentModuleIndex = contextModules.findIndex(m => CONTENT_MODULE_TYPES.includes(m.type));
            if (firstContentModuleIndex !== -1) {
                resumeModuleCandidate = contextModules[firstContentModuleIndex];
                resumeModuleOrderForNav = firstContentModuleIndex + 1;
            }
        }
        
        if (resumeModuleCandidate && resumeModuleOrderForNav !== -1) {
          // Navigate to the determined content module by its order
          navigate(`/course/${identifier}/content/${resumeModuleOrderForNav}`, { replace: true });
          setPageLoading(false); 
          return; 
        } else {
            // If truly no navigable content module, or pre/post test, show error or redirect to list
            // This case should ideally be rare if a course has any content.
            setPageError("Tidak ada modul konten yang dapat ditampilkan untuk dilanjutkan.");
            setPageLoading(false);
            return;
        }
      } 
      
      if (targetModule) {
        if (targetModule.type === 'PRE_TEST_QUIZ' || targetModule.type === 'pre_test') {
          navigate(`/course/${identifier}/pretest`, { replace: true });
          setPageLoading(false);
          return;
        }
        if (targetModule.type === 'POST_TEST_QUIZ' || targetModule.type === 'post_test') {
          navigate(`/course/${identifier}/posttest`, { replace: true });
          setPageLoading(false);
          return;
        }

        setCurrentModule(targetModule);
        setCurrentModuleIndex(targetIndex);
        setNumPages(null); 
        setCurrentPageNumber(1);

        if (CONTENT_MODULE_TYPES.includes(targetModule.type)) {
          if (!isModuleCompleted(targetModule.id)) {
            markModuleAsCompleted(targetModule.id);
          }
        }
      }
      setPageLoading(false);
    } else { // If not loading, no error, but modules are empty or contextModules is null
      // console.log('[CourseContentPage] Condition for error met: contextModules is empty or null, and not loading/no error.'); // Keep this commented or remove
      setPageError("Tidak ada modul konten yang ditemukan untuk kursus ini.");
      setCurrentModule(null);
      setPageLoading(false);
    }
  }, [
    identifier,
    moduleOrderFromParams, // Changed from moduleIdFromParams
    contextModules, 
    progressIsLoading,
    progressError,
    user, // Added user to ensure context re-evaluates if user changes
    fetchCourseProgressAndModules,
    navigate,
    lastAccessedModuleId,
    isModuleCompleted,
    markModuleAsCompleted,
    fetchedByIdentifier
  ]);

  const CONTENT_MODULE_TYPES_FOR_NAV = ['PAGE', 'pdf', 'web', 'VIDEO', 'text', 'video'];

  const handleNextModule = () => {
    if (!currentModule || currentModuleIndex === -1 || !contextModules || contextModules.length === 0) return;

    if (CONTENT_MODULE_TYPES_FOR_NAV.includes(currentModule.type) && !isModuleCompleted(currentModule.id)) {
      markModuleAsCompleted(currentModule.id);
    }

    let nextNavigableModule = null;
    let nextModuleOrder = -1;
    for (let i = currentModuleIndex + 1; i < contextModules.length; i++) {
      const mod = contextModules[i];
      if (['PAGE', 'pdf', 'web', 'VIDEO', 'text', 'video', 'PRE_TEST_QUIZ', 'pre_test', 'POST_TEST_QUIZ', 'post_test'].includes(mod.type)) {
        nextNavigableModule = mod;
        nextModuleOrder = i + 1; // 1-based order
        break;
      }
    }

    if (nextNavigableModule) {
      if (nextNavigableModule.type === 'PRE_TEST_QUIZ' || nextNavigableModule.type === 'pre_test') {
        navigate(`/course/${identifier}/pretest`);
      } else if (nextNavigableModule.type === 'POST_TEST_QUIZ' || nextNavigableModule.type === 'post_test') {
        navigate(`/course/${identifier}/posttest`);
      } else if (nextModuleOrder !== -1) { // Check if it's a content module with a valid order
        navigate(`/course/${identifier}/content/${nextModuleOrder}`);
      } else {
        // Should not happen if logic is correct, but as a fallback:
        navigate(`/course/${identifier}/posttest`); 
      }
    } else {
      navigate(`/course/${identifier}/posttest`);
    }
  };

  const handlePreviousModule = () => {
    // Logic for handlePreviousModule should be here
    // For now, I'll add a placeholder and ensure the structure is correct.
    // TODO: Implement actual previous module navigation logic similar to handleNextModule
    if (!currentModule || currentModuleIndex === -1 || !contextModules || contextModules.length === 0) return;

    let prevNavigableModule = null;
    let prevModuleOrder = -1;
    for (let i = currentModuleIndex - 1; i >= 0; i--) {
      const mod = contextModules[i];
      if (['PAGE', 'pdf', 'web', 'VIDEO', 'text', 'video', 'PRE_TEST_QUIZ', 'pre_test', 'POST_TEST_QUIZ', 'post_test'].includes(mod.type)) {
        prevNavigableModule = mod;
        prevModuleOrder = i + 1; // 1-based order
        break;
      }
    }

    if (prevNavigableModule) {
      if (prevNavigableModule.type === 'PRE_TEST_QUIZ' || prevNavigableModule.type === 'pre_test') {
        navigate(`/course/${identifier}/pretest`);
      } else if (prevNavigableModule.type === 'POST_TEST_QUIZ' || prevNavigableModule.type === 'post_test') {
        navigate(`/course/${identifier}/posttest`);
      } else if (prevModuleOrder !== -1) { // Check if it's a content module with a valid order
        navigate(`/course/${identifier}/content/${prevModuleOrder}`);
      } else {
        // Fallback, though less likely for previous
        navigate(`/course/${identifier}/moduleslist`);
      }
    } else {
      navigate(`/course/${identifier}/moduleslist`);
    }
  }; // THIS WAS THE MISSING BRACE

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
      <div className="mb-6">
        <Link 
          to={`/course/${identifier}/moduleslist`}  // Use identifier and corrected path segment
          className="inline-flex items-center text-teraplus-accent hover:text-teraplus-hover focus:outline-none focus:ring-2 focus:ring-teraplus-accent-light rounded-md px-3 py-1 transition-colors duration-150"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Daftar Modul
        </Link>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-teraplus-text-default mb-2">
        {currentModule ? currentModule.judul : 'Memuat judul modul...'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Modul {currentModuleIndex + 1} dari {totalModulesInCourse} dalam kursus '{contextCourseTitle || 'Nama Kursus Tidak Diketahui'}'
      </p>

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200 min-h-[400px]">
        {currentModule.type === 'PAGE' && currentModule.initialContent && (
          <div className="ql-snow"> {/* Outer container for theme styles if needed */}
            <div className="ql-editor prose max-w-none" dangerouslySetInnerHTML={{ __html: currentModule.initialContent }} />
          </div>
        )}
        {currentModule.type === 'PAGE' && !currentModule.initialContent && currentModule.contentText && (
          <div className="prose max-w-none">
            <p>{currentModule.contentText}</p>
          </div>
        )}
        {currentModule.type === 'pdf' && currentModule.pdfPath && (
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-3">{currentModule.judul}</h2>
            <div className="w-full bg-gray-100 rounded-lg overflow-hidden flex flex-col" style={{ height: '1200px' }}> {/* Restored overflow-hidden, kept inline style for height */}


              <Document
                file={currentModule.pdfPath} // Make sure pdfPath is correct
                className="flex-grow min-h-0 flex flex-col" // Allow document to grow and share space
                loading={
                  <div className="flex justify-center items-center flex-grow"> 
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teraplus-accent"></div>
                  </div>
                }
                error={
                  <div className="flex justify-center items-center flex-grow"> 
                    Gagal memuat PDF. Pastikan file tersedia dan dalam format yang benar.
                  </div>
                }
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <Page
                  pageNumber={currentPageNumber}
                  height={1170} // Increased height for the page rendering
                  // width prop removed to allow scaling to container
                  className="w-full h-full flex flex-col" // Page's wrapper div tries to fill Document, and is a flex container
                  renderTextLayer={false} // Keep false for performance unless specified
                  renderAnnotationLayer={false} // Keep false for performance unless specified
                  loading={
                    <div className="flex justify-center items-center flex-grow"> {/* Use flex-grow */}
                      Memuat halaman...
                    </div>
                  }
                  error={
                    <div className="flex justify-center items-center flex-grow"> {/* Use flex-grow */}
                      Gagal memuat halaman PDF.
                    </div>
                  }
                />
              </Document>
              {numPages && (
                <div className="mt-4 flex justify-center items-center space-x-4 shrink-0"> {/* Added shrink-0 */}
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
