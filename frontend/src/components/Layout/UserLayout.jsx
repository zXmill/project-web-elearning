import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const UserLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user session data (e.g., token, user info)
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    // Redirect to login page
    navigate('/login');
  };

  // Get user email from localStorage or fallback
  const email = localStorage.getItem('userEmail') || 'Pengguna';

  return (
    <div className="min-h-screen flex flex-col bg-teraplus-page-bg"> {/* bg-teraplus-page-bg is now white */}
      <Header email={email} onLogout={handleLogout} />
      
      <main className="flex-grow pb-8"> {/* Removed top padding (py-8 -> pb-8) */}
        {children}
      </main>
    </div>
  );
};

export default UserLayout;
