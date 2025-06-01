import React, { createContext, useState, useContext } from 'react';

const CourseProgressContext = createContext();

export const CourseProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState({
    completedModules: 0,
    totalModules: 0
  });

  const updateProgress = (completedModules, totalModules) => {
    setProgress({ completedModules, totalModules });
  };

  return (
    <CourseProgressContext.Provider value={{ progress, updateProgress }}>
      {children}
    </CourseProgressContext.Provider>
  );
};

export const useCourseProgress = () => useContext(CourseProgressContext);
