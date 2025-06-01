import React from 'react';
import { CheckCircleIcon, PlayIcon, AcademicCapIcon } from '@heroicons/react/24/solid';

const CourseProgress = ({ modules, completedModules }) => {
  const totalModules = modules.length;
  const completedCount = completedModules.length;
  const progressPercentage = (completedCount / totalModules) * 100;

  const getModuleStatus = (moduleId) => {
    if (completedModules.includes(moduleId)) {
      return 'completed';
    }
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    const lastCompletedIndex = Math.max(
      ...completedModules.map(id => modules.findIndex(m => m.id === id)),
      -1
    );
    return moduleIndex === lastCompletedIndex + 1 ? 'current' : 'locked';
  };

  const getModuleIcon = (module, status) => {
    if (status === 'completed') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    if (module.isPreTest || module.isPostTest) {
      return <AcademicCapIcon className={`h-5 w-5 ${
        status === 'current' ? 'text-blue-500' : 'text-gray-400'
      }`} />;
    }
    return <PlayIcon className={`h-5 w-5 ${
      status === 'current' ? 'text-blue-500' : 'text-gray-400'
    }`} />;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
          <span className="text-sm font-medium text-gray-600">
            {completedCount} of {totalModules} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Module List */}
      <div className="space-y-3">
        {modules.map((module) => {
          const status = getModuleStatus(module.id);
          return (
            <div
              key={module.id}
              className={`flex items-center p-3 rounded-lg ${
                status === 'current'
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : status === 'completed'
                  ? 'bg-green-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="mr-3">
                {getModuleIcon(module, status)}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  status === 'locked' ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {module.judul}
                </h4>
                <p className={`text-xs ${
                  status === 'locked' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {module.isPreTest ? 'Pre-Test' :
                   module.isPostTest ? 'Post-Test' :
                   `${module.type.charAt(0).toUpperCase() + module.type.slice(1)} Content`}
                </p>
              </div>
              {status === 'completed' && (
                <span className="text-xs font-medium text-green-600">
                  Completed
                </span>
              )}
              {status === 'current' && (
                <span className="text-xs font-medium text-blue-600">
                  In Progress
                </span>
              )}
              {status === 'locked' && (
                <span className="text-xs font-medium text-gray-400">
                  Locked
                </span>
              )}
            </div>
          );
        })}
      </div>

      {progressPercentage === 100 && (
        <div className="mt-6 text-center">
          <p className="text-green-600 font-medium mb-3">
            Congratulations! You've completed the course!
          </p>
          <button
            onClick={() => window.location.href = `/courses/${modules[0].courseId}/certificate`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View Certificate
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;
