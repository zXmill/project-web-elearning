import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api'; // Assuming api service handles token storage/retrieval
import { jwtDecode } from 'jwt-decode'; // Added for decoding token if needed locally

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To track initial auth status check
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedUser = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedUser.exp < currentTime) {
            // Token expired
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            setUser(null);
            delete api.defaults.headers.common['Authorization'];
            setError('Session expired. Please login again.');
          } else {
            // Token valid
            let userToSet = decodedUser;
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Attempt to fetch full profile to enrich user context
            try {
              const profileResponse = await api.get('/auth/profile');
              if (profileResponse.data && profileResponse.data.status === 'success') {
                const fullUserProfile = profileResponse.data.data.user;
                userToSet = { ...decodedUser, ...fullUserProfile }; // Merge token data with profile data
              }
            } catch (profileError) {
              console.error("AuthContext: Failed to fetch full profile during initial check", profileError);
              // userToSet remains the decodedUser from token
            }
            
            setUser(userToSet); // Set user state once with the most complete data
            
            // Persist details to localStorage based on the final userToSet
            localStorage.setItem('userEmail', userToSet.email);
            if (userToSet.namaLengkap) localStorage.setItem('userName', userToSet.namaLengkap);
            localStorage.setItem('userRole', userToSet.role);
          }
        } catch (e) {
          console.error("Invalid token on load:", e);
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          localStorage.removeItem('userRole');
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
          setError('Invalid session. Please login again.');
        }
      }
      setLoading(false);
    };
    checkLoggedInUser();
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        const decodedUserFromToken = jwtDecode(response.data.token);
        let userToSet = decodedUserFromToken; // Start with minimal info from token
        
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Attempt to fetch full profile to enrich user context
        try {
          const profileResponse = await api.get('/auth/profile');
          if (profileResponse.data && profileResponse.data.status === 'success') {
            const fullUserProfile = profileResponse.data.data.user;
            userToSet = { ...decodedUserFromToken, ...fullUserProfile }; // Merge token data with profile data
          }
        } catch (profileError) {
          console.error("AuthContext: Failed to fetch full profile after login", profileError);
          // userToSet remains the decodedUserFromToken
        }

        setUser(userToSet); // Set user state once with the most complete data obtained
        
        // Persist details to localStorage based on the final userToSet
        localStorage.setItem('userEmail', userToSet.email);
        if (userToSet.namaLengkap) localStorage.setItem('userName', userToSet.namaLengkap);
        localStorage.setItem('userRole', userToSet.role);
        
        setLoading(false);
        return true;
      } else {
        setError(response.data?.message || 'Login failed: No token received');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred during login.';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, [setUser, setLoading, setError]); // Dependencies for useCallback

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    // setError(null); // Clear errors on logout
  }, [setUser]); // Dependencies for useCallback

  const clearAuthError = useCallback(() => {
    setError(null);
  }, [setError]);

  // The value provided to consuming components
  const value = useMemo(() => ({
    user,
    setUser, // ***** THIS IS THE FIX: Provide setUser *****
    isAuthenticated: !!user,
    login,
    logout,
    loadingAuth: loading,
    errorAuth: error,
    clearAuthError,
  }), [user, setUser, loading, login, logout, error, clearAuthError]); // ***** Added setUser to dependencies *****

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render children until initial auth check is done, unless you have a specific loading UI for children */}
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Handle case where context might be null if accessed very early (though !loading in provider should prevent this for children)
  if (context === null) {
     // Ensure the fallback object shape matches what components expect, including setUser
     return { user: null, setUser: () => {}, isAuthenticated: false, loadingAuth: true, errorAuth: null, login: async () => false, logout: () => {}, clearAuthError: () => {} };
  }
  return context;
};
