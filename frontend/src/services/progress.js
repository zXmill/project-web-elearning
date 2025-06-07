import api from '../services/api';

// Fetch user progress for a course
export async function fetchUserProgress(courseIdentifier) { // Renamed courseId to courseIdentifier
  const response = await api.get(`/courses/${courseIdentifier}/progress`);
  return response.data;
}
