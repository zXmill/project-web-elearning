import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircleIcon, ArrowLeftOnRectangleIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
const logo = '/logo-vert.png'; // Correct way to reference images in public folder
import SearchBar from '../Common/SearchBar'; 
import { useAuth } from '../../contexts/AuthContext'; // Corrected useAuth import
import api from '../../services/api'; // Import api for base URL

// Helper function to get user initials
const getUserInitials = (name) => {
  if (!name) return '';
  const nameParts = name.split(' ');
  if (nameParts.length > 1 && nameParts[0] && nameParts[nameParts.length - 1]) {
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  }
  if (nameParts[0] && nameParts[0][0]) {
    return nameParts[0][0].toUpperCase();
  }
  return '';
};

const Header = () => {
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');

  const { user, loading: authLoading } = useAuth();

  // userName state can still be used for other purposes if needed, 
  // but for avatar display, we'll use user prop directly.
  // The useEffect for userName might still be useful for the dropdown's detailed view.
  useEffect(() => {
    if (user) {
      setUserName(user.namaLengkap || user.email || 'User');
    } else if (!authLoading) {
      setUserName('');
    }
  }, [user, authLoading]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Optionally remove other user-related items from localStorage
    navigate('/login');
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log("Search initiated for:", query);
    // Example: navigate(`/search?q=${query}`);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileButton = document.getElementById('profile-dropdown-button');
      const profileMenu = document.getElementById('profile-dropdown-menu');
      if (isProfileDropdownOpen && profileButton && !profileButton.contains(event.target) && profileMenu && !profileMenu.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  if (authLoading) {
    // Render a minimal header or a loading state if preferred
    return (
      <header className="bg-white shadow-md sticky top-0 z-40">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>Loading...</div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Site Name */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img className="h-10 w-auto" src={logo} alt="Logo Teraplus" />
              <span className="ml-3 text-xl font-semibold text-teraplus-primary">TERAPLUS</span>
            </Link>
          </div>

          {/* Desktop Navigation Links & Search (REMOVED AS PER REQUEST) */}
          
          {/* Mobile Menu Button & Profile Dropdown */}
          <div className="flex items-center ml-auto"> {/* Added ml-auto to push profile to the right */}
            <div className="md:hidden mr-2">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teraplus-primary p-2 rounded-md"
                aria-label="Open main menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative ml-3">
                <div>
                  <button
                    id="profile-dropdown-button"
                    onClick={toggleProfileDropdown}
                    className="max-w-xs bg-gray-200 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teraplus-primary p-1 hover:bg-gray-300 transition-colors"
                    aria-expanded={isProfileDropdownOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    {user.profilePicture ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `${api.defaults.baseURL.replace('/api', '')}${user.profilePicture.startsWith('/') ? user.profilePicture : '/' + user.profilePicture}`}
                        alt="Profile"
                      />
                    ) : (
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-teraplus-secondary">
                        {/* Use user.namaLengkap or user.email directly for initials */}
                        <span className="text-sm font-medium leading-none text-white">{getUserInitials(user.namaLengkap || user.email)}</span>
                      </span>
                    )}
                    {/* Display user.namaLengkap or user.email directly */}
                    <span className="hidden md:block ml-2 text-sm font-medium text-gray-700">{user.namaLengkap || user.email || ''}</span>
                  </button>
                </div>
                {isProfileDropdownOpen && (
                  <div
                    id="profile-dropdown-menu"
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-slate-50 ring-1 ring-black ring-opacity-5 focus:outline-none z-50" // Changed background to bg-slate-50
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="profile-dropdown-button"
                  >
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200"> {/* Adjusted border color */}
                      <p className="font-medium">Signed in as</p>
                      {/* userName state is fine here for the dropdown's more detailed display if it's kept updated */}
                      <p className="truncate font-semibold">{userName}</p> 
                      {user.role && <p className="text-xs text-gray-500 capitalize">({user.role})</p>}
                    </div>
                    <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left" role="menuitem"> {/* Adjusted hover color */}
                      <UserCircleIcon className="h-5 w-5 mr-3 text-gray-500" />
                      Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left" role="menuitem"> {/* Adjusted hover color */}
                        <Cog8ToothIcon className="h-5 w-5 mr-3 text-gray-500" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left" // Adjusted hover color
                      role="menuitem"
                    >
                      <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login" className="text-gray-700 hover:text-teraplus-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-teraplus-primary text-white hover:bg-teraplus-accent px-4 py-2 rounded-md text-sm font-medium transition-colors">Register</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} absolute top-16 inset-x-0 bg-white shadow-lg z-30 rounded-b-md`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <SearchBar onSearch={handleSearch} placeholder="Cari kursus..." />
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Admin Panel</Link>
            )}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Profile</Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-gray-700 hover:bg-gray-100 block w-full text-left px-3 py-2 rounded-md text-base font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Login</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Register</Link>
              </>
            )}
            {/* Add other mobile navigation links here */}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
