import api from '../services/api';

// Fetch user progress for a course
export async function fetchUserProgress(courseId) {
  const response = await api.get(`/courses/${courseId}/progress`);
  return response.data;
}
