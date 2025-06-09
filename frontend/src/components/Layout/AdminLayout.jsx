import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { HomeIcon, UsersIcon, BookOpenIcon, DocumentTextIcon, CogIcon, ArrowLeftOnRectangleIcon, ArrowUturnLeftIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const AdminLayout = () => {
  const location = useLocation();
  // Initialize sidebar state based on screen size
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768); // md breakpoint

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Courses', href: '/admin/courses', icon: BookOpenIcon },
    { name: 'Content', href: '/admin/content', icon: DocumentTextIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  // Effect to handle window resize and adjust sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // md breakpoint
        setIsSidebarOpen(false); // Close sidebar on small screens by default
      } else {
        setIsSidebarOpen(true); // Open sidebar on larger screens
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Call on initial mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Effect to close sidebar on route change on small screens
  useEffect(() => {
    if (window.innerWidth < 768 && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isSidebarOpen]);


  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Overlay for small screens when sidebar is open */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-gray-800 text-white flex flex-col w-64 transform transition-transform duration-300 ease-in-out z-40
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:flex-shrink-0`} // md:relative ensures it pushes content
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <Link to="/admin" className="text-2xl font-semibold hover:text-gray-300">
            TeraPlus Admin
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-300 hover:text-white focus:outline-none md:hidden" // Only show close on small screens
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }} // Close on nav item click on small screens
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white
                ${location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href)) ? 'bg-gray-900 text-white' : 'text-gray-300'}`}
            >
              <item.icon className="h-5 w-5 mr-3" aria-hidden="true" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4 space-y-2 border-t border-gray-700">
          <Link
            to="/"
            className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <ArrowUturnLeftIcon className="h-5 w-5 mr-3" aria-hidden="true" />
            Go to Homepage
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-grow">
        {/* Header for main content, including toggle for all screen sizes */}
        <header className="bg-white shadow-sm p-3 sticky top-0 z-50"> {/* Increased z-index to 50 */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />} {/* Corrected icon logic */}
          </button>
        </header>
        
        <main
          className={`flex-grow p-6 md:p-8 overflow-auto`} // Margin adjustment is handled by sidebar's relative/fixed positioning
        >
          <Outlet /> {/* Child routes will render here */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
