import React, { useState, useEffect, createContext, useContext } from 'react';
import api from '../services/api';

// 1. Create AuthContext
const AuthContext = createContext(null);

// 2. Create AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/profile', {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          });
          if (response.data && response.data.status === 'success') {
            setUser(response.data.data.user);
          } else {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, []); // This useEffect runs once on AuthProvider mount

  // The value provided to context consumers
  const contextValue = {
    user,
    setUser, // This setUser will now update the shared state in AuthProvider
    loading,
    // Potentially add login/logout functions here in the future
    // For example, a logout function:
    logout: () => {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      // Optionally redirect to login page
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Modify useAuth hook to consume the context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;

// Note: The parseJwt function was removed as it wasn't being used in the hook's logic.
// If it's needed elsewhere, it can be kept or moved to a utils file.
