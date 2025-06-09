import axios from 'axios';

// Determine the base URL based on the environment
// For Netlify, API calls go to /.netlify/functions/<function-name>
// For local development with `netlify dev`, it's the same relative path.
// The `REACT_APP_API_URL` might still be useful if you have a staging environment
// not on Netlify or for other specific overrides, but the default should be Netlify paths.

let apiBase;
let staticAssetBase;

if (process.env.NODE_ENV === 'production') {
  // In production on Netlify, all API calls are relative to the root.
  // Example: '/.netlify/functions/auth' for the auth function.
  // We set a common prefix, and specific function names will be part of the request path.
  apiBase = '/.netlify/functions'; 
  // Static assets like profile pictures are now on Cloudinary.
  // If other static assets are served from the backend (less common with Netlify),
  // this would need to point to the deployed site URL or a CDN.
  // For now, assuming Cloudinary handles user-uploaded assets.
  staticAssetBase = ''; // Or your site's root URL if needed for other assets.
} else {
  // For local development using `netlify dev` or a local server proxying to functions
  apiBase = '/.netlify/functions'; // `netlify dev` proxies this to your functions
  // staticAssetBase = 'http://localhost:3001'; // If you still run a local backend for some assets
                                            // But for Cloudinary assets, this isn't used.
  staticAssetBase = ''; // Or your local dev server root if needed.
}

// Override with REACT_APP_API_URL if it's explicitly set (e.g., for a different staging)
if (process.env.REACT_APP_API_URL) {
  apiBase = process.env.REACT_APP_API_URL;
}
// REACT_APP_STATIC_ASSET_URL could be used for an explicit static asset host if needed.
// if (process.env.REACT_APP_STATIC_ASSET_URL) {
//   staticAssetBase = process.env.REACT_APP_STATIC_ASSET_URL;
// }


const api = axios.create({
  baseURL: apiBase, // e.g., '/.netlify/functions'
  withCredentials: true // Be cautious with this for cross-origin Netlify functions if not configured properly
});

// BACKEND_URL is now less relevant for Cloudinary-hosted profile pictures.
// It might be used if you have other static assets served from your backend's public folder,
// but with Netlify, those would typically be in your frontend's publish directory or a CDN.
export const BACKEND_URL = staticAssetBase; 

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
