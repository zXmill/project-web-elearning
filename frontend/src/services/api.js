import axios from 'axios';

// For baseURL of API calls (e.g., http://localhost:3001/api or https://your-backend.com/api)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// For the plain backend URL, often used for static assets if served from backend
// (e.g., http://localhost:3001 or https://your-backend.com)
// If your static assets are not served from the backend, you might not need this,
// or it might point to a different URL (like an S3 bucket URL directly).
// For now, let's assume it's related to the API_BASE_URL.
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || (API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL);


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export const BACKEND_URL = BACKEND_BASE_URL; // Export the base URL

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  response => response, // Simply return response on success
  error => {
    console.error('Axios error interceptor:', error); // Log the raw error
    if (error.response) {
      console.error('Axios error response data:', error.response.data);
      console.error('Axios error response status:', error.response.status);
      console.error('Axios error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Axios error request:', error.request); // No response received
    } else {
      console.error('Axios error message:', error.message); // Error in setting up request
    }
    return Promise.reject(error); // Important: re-reject the error so it can be caught by component
  }
);

// Function to handle bulk user creation by admin
export const bulkCreateUsersAdmin = async (formData) => {
  try {
    const response = await api.post('/admin/users/bulk-create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Assuming the backend returns { status, message, data }
  } catch (error) {
    // The error will be processed by the interceptor, but we can throw it again
    // or handle it specifically if needed here.
    // For now, let the interceptor handle logging and re-throw.
    console.error('Error in bulkCreateUsersAdmin service call:', error.response?.data || error.message);
    throw error; // Re-throw to be caught by the component
  }
};

// --- Admin Enrollment & Certificate Management ---
export const getEnrollmentsForApprovalAdmin = async () => {
  try {
    const response = await api.get('/admin/enrollments/approval');
    return response.data;
  } catch (error) {
    console.error('Error in getEnrollmentsForApprovalAdmin service call:', error.response?.data || error.message);
    throw error;
  }
};

export const updateEnrollmentPracticalTestDetailsAdmin = async (enrollmentId, data) => {
  try {
    const response = await api.put(`/admin/enrollments/${enrollmentId}/practical-test`, data);
    return response.data;
  } catch (error) {
    console.error('Error in updateEnrollmentPracticalTestDetailsAdmin service call:', error.response?.data || error.message);
    throw error;
  }
};

export const approveEnrollmentCertificateAdmin = async (enrollmentId) => {
  try {
    const response = await api.put(`/admin/enrollments/${enrollmentId}/approve-certificate`);
    return response.data;
  } catch (error) {
    console.error('Error in approveEnrollmentCertificateAdmin service call:', error.response?.data || error.message);
    throw error;
  }
};

export const rejectEnrollmentCertificateAdmin = async (enrollmentId, data) => {
  try {
    const response = await api.put(`/admin/enrollments/${enrollmentId}/reject-certificate`, data);
    return response.data;
  } catch (error) {
    console.error('Error in rejectEnrollmentCertificateAdmin service call:', error.response?.data || error.message);
    throw error;
  }
};

export default api;
