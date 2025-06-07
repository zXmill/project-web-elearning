import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseNavigation = ({ courseId, modules, currentModuleId }) => {
  const navigate = useNavigate();
  
  const currentIndex = modules.findIndex(m => m.id === currentModuleId);
  const currentModule = modules[currentIndex];
  const nextModule = modules[currentIndex + 1];
  const prevModule = modules[currentIndex - 1];

  const handleNavigation = (module) => {
    if (!module) return;

    if (module.isPreTest) {
      navigate(`/courses/${courseId}/pretest/${module.id}`);
    } else if (module.isPostTest) {
      navigate(`/courses/${courseId}/posttest/${module.id}`);
    } else {
      if (module.order !== undefined) {
        navigate(`/course/${courseId}/content/${module.order}`);
      } else {
        console.error("Module order undefined for navigation", module);
        alert("Terjadi kesalahan: Urutan modul tidak ditemukan.");
      }
    }
  };

  return (
    <div className="flex justify-between items-center mt-8 space-x-4">
      <button
        onClick={() => handleNavigation(prevModule)}
        disabled={!prevModule}
        className={`px-6 py-2 rounded-lg transition-colors ${
          prevModule
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Previous Module
      </button>

      <div className="flex-1 text-center">
        <span className="text-sm text-gray-500">
          Module {currentIndex + 1} of {modules.length}
        </span>
      </div>

      <button
        onClick={() => handleNavigation(nextModule)}
        disabled={!nextModule}
        className={`px-6 py-2 rounded-lg transition-colors ${
          nextModule
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {nextModule ? (
          nextModule.isPostTest ? 'Start Post-Test' : 'Next Module'
        ) : (
          'Complete'
        )}
      </button>
    </div>
  );
};

export default CourseNavigation;
