import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', 
  withCredentials: true                  
});

export const BACKEND_URL = 'http://localhost:3001'; // Export the base URL for static assets

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

export default api;
