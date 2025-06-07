import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import api from '../services/api'; // Assuming your API service is set up
import { useAuth } from './AuthContext'; // To get the current user

const CourseProgressContext = createContext();

export const CourseProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState(''); // Added courseTitle state
  const [modules, setModules] = useState([]);
  const [completedModuleIds, setCompletedModuleIds] = useState(new Set());
  const [lastAccessedModuleId, setLastAccessedModuleId] = useState(null);
  const [isPreTestCompleted, setIsPreTestCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedByIdentifier, setFetchedByIdentifier] = useState(null); // Added

  const getPreTestModuleFromList = (moduleList) => {
    return moduleList.find(m => m.type === 'PRE_TEST_QUIZ');
  };

  const getPostTestModuleFromList = (moduleList) => { // New helper function
    return moduleList.find(m => m.type === 'POST_TEST_QUIZ');
  };

  // Parameter renamed to 'identifierToFetchBy' for clarity, as it can be a slug or numeric ID.
  const fetchCourseProgressAndModules = useCallback(async (identifierToFetchBy) => {
    if (!user || !identifierToFetchBy) {
      // Reset progress if no user or identifierToFetchBy
      setModules([]);
      setCompletedModuleIds(new Set());
      setLastAccessedModuleId(null);
      setIsPreTestCompleted(false);
      setCurrentCourseId(null); // Ensure currentCourseId (numeric) is nulled.
      setCourseTitle(''); // Reset course title
      setFetchedByIdentifier(null); // Reset fetchedByIdentifier
      return;
    }

    setIsLoading(true);
    setError(null);
    // setCurrentCourseId(identifierToFetchBy); // REMOVED: currentCourseId should only store the numeric ID from response.

    try {
      console.log(`[CourseProgressContext] fetchCourseProgressAndModules: Called with identifierToFetchBy = ${identifierToFetchBy}`);
      // Fetch all modules and user's progress for this course in a single call
      // API endpoint uses the identifier (slug or ID)
      const response = await api.get(`/courses/${identifierToFetchBy}/progress`);

      const responseData = response.data?.data;
      console.log(`[CourseProgressContext] fetchCourseProgressAndModules: Raw responseData for ${identifierToFetchBy}:`, responseData);

      const numericCourseIdFromResponse = responseData ? responseData.courseId : undefined;
      console.log(`[CourseProgressContext] fetchCourseProgressAndModules: Extracted numericCourseIdFromResponse: ${numericCourseIdFromResponse}`);
      
      // IMPORTANT: Set currentCourseId with the numeric ID from the response.
      console.log(`[CourseProgressContext] fetchCourseProgressAndModules: Attempting to set currentCourseId with: ${numericCourseIdFromResponse}`);
      setCurrentCourseId(numericCourseIdFromResponse);
      setCourseTitle(responseData?.courseTitle || ''); // Set course title from response
      console.log(`[CourseProgressContext] fetchCourseProgressAndModules: Setting fetchedByIdentifier to ${identifierToFetchBy}`);
      setFetchedByIdentifier(identifierToFetchBy); // Set the identifier used for this successful fetch
      const fetchedModules = responseData?.modules?.sort((a, b) => a.order - b.order) || [];
      setModules(fetchedModules);

      // User progress is now an array of objects, e.g., [{ moduleId, completedAt, score }, ...]
      // We need to derive completedModuleIds and lastAccessedModuleId from this array.
      const fetchedUserProgressArray = responseData?.userProgress || [];
      
      const completedIds = new Set();
      let latestAccessTime = null;
      let newLastAccessedModuleId = null;

      fetchedUserProgressArray.forEach(progressItem => {
        if (progressItem.completedAt) {
          completedIds.add(progressItem.moduleId);
        }
        // Determine last accessed module based on lastAccessedAt timestamp
        if (progressItem.lastAccessedAt) {
          const accessDate = new Date(progressItem.lastAccessedAt);
          if (!latestAccessTime || accessDate > latestAccessTime) {
            latestAccessTime = accessDate;
            newLastAccessedModuleId = progressItem.moduleId;
          }
        }
      });
      
      setCompletedModuleIds(completedIds);
      // If no progress items have lastAccessedAt, keep existing or set to null
      setLastAccessedModuleId(newLastAccessedModuleId || fetchedModules[0]?.id || null);


      // Determine if pre-test is completed
      const preTestModule = getPreTestModuleFromList(fetchedModules);
      if (preTestModule && completedIds.has(preTestModule.id)) {
        setIsPreTestCompleted(true);
      } else {
        setIsPreTestCompleted(false);
      }

    } catch (err) {
      console.error("Error fetching course progress and modules:", err);
      setError(err.response?.data?.message || 'Gagal memuat progres kursus.');
      // Reset state on error to avoid inconsistent data
      setModules([]);
      setCompletedModuleIds(new Set());
      setLastAccessedModuleId(null);
      setIsPreTestCompleted(false);
      setCurrentCourseId(null); // Ensure currentCourseId (numeric) is nulled on error.
      setCourseTitle(''); // Reset course title on error.
      setFetchedByIdentifier(null); // Clear fetchedByIdentifier on error
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markModuleAsCompleted = useCallback(async (moduleId) => {
    if (!user || !currentCourseId || !moduleId) return;

    // Optimistic update
    const newCompletedModuleIds = new Set(completedModuleIds);
    newCompletedModuleIds.add(moduleId);
    setCompletedModuleIds(newCompletedModuleIds);
    setLastAccessedModuleId(moduleId);

    const preTestModule = getPreTestModuleFromList(modules);
    if (preTestModule && preTestModule.id === moduleId) {
      setIsPreTestCompleted(true);
    }

    try {
      // Using existing backend endpoint: POST /api/courses/:courseId/modules/:moduleId/complete
      // It takes courseId and moduleId from URL params, not body.
      await api.post(`/courses/${currentCourseId}/modules/${moduleId}/complete`, {});
      // If backend fails, ideally we'd revert optimistic update, but for now, keep it simple
    } catch (err) {
      console.error("Error marking module as completed:", err);
      setError(err.response?.data?.message || 'Gagal menyimpan progres.');
      // Revert optimistic update on error
      const revertedCompletedModuleIds = new Set(completedModuleIds);
      revertedCompletedModuleIds.delete(moduleId);
      setCompletedModuleIds(revertedCompletedModuleIds);
      // Potentially revert lastAccessedModuleId and isPreTestCompleted if necessary
      // This part can be complex depending on exact requirements for rollback.
    }
  }, [user, currentCourseId, modules, completedModuleIds]); // Added dependencies for markModuleAsCompleted

  const recordAndMarkTestAsCompleted = useCallback(async (moduleId, score) => {
    if (!user || !currentCourseId || !moduleId || typeof score !== 'number') {
      console.error("Invalid arguments for recordAndMarkTestAsCompleted", { user, currentCourseId, moduleId, score });
      setError('Gagal menyimpan skor tes: argumen tidak valid.');
      return;
    }

    // Optimistic update
    const newCompletedModuleIds = new Set(completedModuleIds);
    newCompletedModuleIds.add(moduleId);
    setCompletedModuleIds(newCompletedModuleIds);
    setLastAccessedModuleId(moduleId);

    // Optimistically update pre-test completion status if it's the pre-test module
    const preTestModule = getPreTestModuleFromList(modules);
    if (preTestModule && preTestModule.id === moduleId) {
      setIsPreTestCompleted(true);
    }
    // Note: Post-test completion status isn't explicitly tracked in this context beyond being in completedModuleIds

    try {
      // Backend endpoint for recording score: POST /api/courses/:courseId/modules/:moduleId/record-score
      // This endpoint should also mark the module as complete in the backend.
      await api.post(`/courses/${currentCourseId}/modules/${moduleId}/record-score`, { score });
      // console.log(`Test score ${score} for module ${moduleId} recorded successfully.`);
      // No need to call markModuleAsCompleted separately if recordTestScore handles completion
    } catch (err) {
      console.error("Error recording test score:", err);
      const errorMessage = err.response?.data?.message || 'Gagal menyimpan skor tes.';
      setError(errorMessage);
      
      // Revert optimistic update on error
      const revertedCompletedModuleIds = new Set(completedModuleIds);
      revertedCompletedModuleIds.delete(moduleId);
      setCompletedModuleIds(revertedCompletedModuleIds);
      
      if (preTestModule && preTestModule.id === moduleId) {
        // Check if it was truly completed before this attempt or rely on next fetch
        const stillCompleted = modules.some(m => m.id === moduleId && completedModuleIds.has(m.id) && m.id !== moduleId); // tricky logic here
        if(!stillCompleted) setIsPreTestCompleted(false); // Revert if this was the action that set it
      }
      // Consider reverting lastAccessedModuleId if it was set to this moduleId
      // For simplicity, current fetch on error or navigation will correct this.
      throw err; // Re-throw the error so the calling component can also handle it
    }
  }, [user, currentCourseId, modules, completedModuleIds]);
  
  const resetProgressForCourse = useCallback(() => {
    setModules([]);
    setCompletedModuleIds(new Set());
      setLastAccessedModuleId(null);
      setIsPreTestCompleted(false);
      setCurrentCourseId(null);
      setCourseTitle(''); // Reset course title
      setFetchedByIdentifier(null); // Reset fetchedByIdentifier
      setError(null);
      setIsLoading(false);
  }, []); 

  const value = {
    currentCourseId,
    courseTitle, // Provide courseTitle in context
    fetchedByIdentifier, // Expose fetchedByIdentifier
    modules, 
    completedModuleIds, 
    lastAccessedModuleId,
    isPreTestCompleted, 
    isLoading,
    error,
    fetchCourseProgressAndModules, // Call this when entering a course page
    markModuleAsCompleted,       // Call this when a module is completed by the user
    isModuleCompleted: (moduleId) => completedModuleIds.has(moduleId),
    getFirstIntroModule: () => modules.find(m => m.order === 0 && m.type === 'PAGE'), // Example, adjust if needed
    getPreTestModule: () => getPreTestModuleFromList(modules),
    getPostTestModule: () => getPostTestModuleFromList(modules), // Added getPostTestModule
    recordAndMarkTestAsCompleted, // Added new function for submitting test scores
    resetProgressForCourse, // Call when leaving a course or on user logout for the course specific data
  };

  return (
    <CourseProgressContext.Provider value={value}>
      {children}
    </CourseProgressContext.Provider>
  );
};

export const useCourseProgress = () => {
  const context = useContext(CourseProgressContext);
  if (context === undefined) {
    throw new Error('useCourseProgress must be used within a CourseProgressProvider');
  }
  return context;
};
