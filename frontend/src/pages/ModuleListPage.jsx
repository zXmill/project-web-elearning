import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCourseProgress } from '../contexts/CourseProgressContext'; // To check module completion

const ModuleListPage = () => {
  const { identifier } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    modules: contextModules, 
    // userProgress: contextUserProgress, // Not directly used in this component's render
    isLoading: progressLoading, 
    error: progressError,
    fetchCourseProgressAndModules,
    isModuleCompleted,
    // getPreTestModule, // Not directly used
    // isPreTestCompleted, // Not directly used for rendering module list items' enabled/disabled state here
    courseTitle: contextCourseTitle, 
    currentCourseId, // This is the numeric ID
    fetchedByIdentifier // This is the identifier (slug or ID) used for the last successful fetch
  } = useCourseProgress();

  const [displayCourseTitle, setDisplayCourseTitle] = useState(''); 
  const [localLoading, setLocalLoading] = useState(true); 

  useEffect(() => {
    const loadData = async () => {
      if (identifier && user) { 
        setLocalLoading(true);
        
        // Fetch if the context hasn't been fetched with the current URL identifier,
        // or if there are no modules (initial load for this identifier).
        if (identifier !== fetchedByIdentifier || !contextModules || contextModules.length === 0) {
            await fetchCourseProgressAndModules(identifier);
        }
        
        // After fetchCourseProgressAndModules, contextCourseTitle should be populated.
        // The rest of the title logic can remain, as it tries to set a display title.
        if (contextCourseTitle) {
            setDisplayCourseTitle(contextCourseTitle);
        } else if (contextModules && contextModules.length > 0 && contextModules[0]?.course?.judul) {
            setDisplayCourseTitle(contextModules[0].course.judul);
        } else if (!progressLoading && identifier === fetchedByIdentifier) { 
            // If done loading for this identifier and title is still missing, try one more fetch for title
            // This is a fallback, ideally title comes with progress.
            try {
                // Use the numeric currentCourseId if available and matches, otherwise the identifier
                const idForTitleFetch = currentCourseId || identifier;
                const courseDetailsResponse = await api.get(`/courses/${idForTitleFetch}`); 
                if (courseDetailsResponse.data?.status === 'success' && courseDetailsResponse.data?.data?.course) {
                    setDisplayCourseTitle(courseDetailsResponse.data.data.course.judul);
                } else {
                    setDisplayCourseTitle('Daftar Modul');
                }
            } catch (e) {
                console.error("Error fetching course title (fallback):", e);
                setDisplayCourseTitle('Daftar Modul');
            }
        } else if (!progressLoading) {
             setDisplayCourseTitle('Daftar Modul'); // Default if still no title and not loading
        }

        setLocalLoading(false);
      } else if (!user) {
        navigate('/login');
      }
    };
    loadData();
  }, [identifier, user, fetchCourseProgressAndModules, navigate, contextModules, progressLoading, currentCourseId, contextCourseTitle, fetchedByIdentifier]); // Added fetchedByIdentifier

  if (localLoading || (progressLoading && identifier !== fetchedByIdentifier)) { // Adjust loading condition
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teraplus-accent"></div>
      </div>
    );
  }

  if (progressError) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">Error memuat progres: {progressError}</div>;
  }

  if (!contextModules || contextModules.length === 0) {
    return <div className="container mx-auto px-4 py-8 text-center">Tidak ada modul tersedia untuk kursus ini.</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to={`/course/${identifier}`} 
          className="inline-flex items-center text-teraplus-accent hover:text-teraplus-hover focus:outline-none focus:ring-2 focus:ring-teraplus-accent-light rounded-md px-3 py-1 transition-colors duration-150"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Detail Kursus
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-teraplus-text-default mb-2">{displayCourseTitle || 'Memuat Judul...'}</h1>
      <p className="text-xl text-gray-600 mb-8">Daftar Modul</p>

      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        <ul className="space-y-3">
          {contextModules.map((module, index) => {
            const completed = isModuleCompleted(module.id);
            let statusText = "Belum dimulai";
            let statusColor = "text-gray-500";
            if (completed) {
              statusText = "Selesai";
              statusColor = "text-green-500";
            }

            let isLocked = false;
            let alertMessage = 'Selesaikan modul sebelumnya dulu.';

            if (index > 0) {
              const prevModule = contextModules[index - 1];
              if (!isModuleCompleted(prevModule.id)) {
                isLocked = true;
              }
            }

            if (module.type === 'POST_TEST_QUIZ') {
              const contentModulesBefore = contextModules.slice(0, index)
                .filter(m => m.type !== 'PRE_TEST_QUIZ' && m.type !== 'POST_TEST_QUIZ');
              if (!contentModulesBefore.every(m => isModuleCompleted(m.id))) {
                isLocked = true; 
                alertMessage = 'Anda harus menyelesaikan semua modul konten sebelum memulai Post-Test.';
              }
            }
            
            const handleModuleClickLocal = () => {
              if (isLocked && !completed) { // Allow clicking completed modules even if "locked" by sequence
                alert(alertMessage);
                return;
              }
          
              if (module.type === 'PRE_TEST_QUIZ') {
                navigate(`/course/${identifier}/pretest`);
              } else if (module.type === 'POST_TEST_QUIZ') {
                navigate(`/course/${identifier}/posttest`);
              } else {
                // Navigate to content modules using their 1-based order (index + 1)
                navigate(`/course/${identifier}/content/${index + 1}`);
              }
            };

            return (
              <li key={module.id}>
                <button
                  onClick={handleModuleClickLocal}
                  disabled={isLocked && !completed} 
                  className={`w-full flex items-center justify-between p-4 rounded-md transition-all duration-150 ease-in-out
                              ${isLocked && !completed ? 'bg-gray-200 cursor-not-allowed opacity-70' 
                                : 'bg-gray-50 hover:bg-teraplus-background-light focus:bg-teraplus-background-light focus:ring-2 focus:ring-teraplus-accent'}
                              border border-gray-200`}
                >
                  <div className="flex items-center">
                    <span className="mr-3 text-teraplus-accent">
                      {module.type === 'CONTENT' && '📄'}
                      {module.type === 'VIDEO' && '▶️'}
                      {module.type === 'PDF' && '📜'}
                      {module.type === 'QUIZ' && '❓'}
                      {module.type === 'PRE_TEST_QUIZ' && '📝'}
                      {module.type === 'POST_TEST_QUIZ' && '🏁'}
                    </span>
                    <span className={`font-medium ${isLocked && !completed ? 'text-gray-500' : 'text-teraplus-text-default'}`}>
                      {module.judul}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm mr-3 ${statusColor} ${isLocked && !completed ? 'text-gray-400' : ''}`}>
                      {statusText}
                    </span>
                    {completed ? (
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ) : (
                      <svg className={`w-6 h-6 ${isLocked && !completed ? 'text-gray-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ModuleListPage;
