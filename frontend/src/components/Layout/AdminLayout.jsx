import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { HomeIcon, UsersIcon, BookOpenIcon, DocumentTextIcon, CogIcon, ArrowLeftOnRectangleIcon, ArrowUturnLeftIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'; // Added ArrowUturnLeftIcon and ClipboardDocumentCheckIcon

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Courses', href: '/admin/courses', icon: BookOpenIcon },
    { name: 'Content', href: '/admin/content', icon: DocumentTextIcon },
    { name: 'Enrollment Approvals', href: '/admin/enrollment-management', icon: ClipboardDocumentCheckIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  ];

  // Basic logout function (can be expanded)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole'); // Clear role on logout
    window.location.href = '/login'; // Redirect to login
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link to="/admin" className="text-2xl font-semibold hover:text-gray-300">
            TeraPlus Admin
          </Link>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white
                ${location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href)) ? 'bg-gray-900 text-white' : 'text-gray-300'}`}
            >
              <item.icon className="h-5 w-5 mr-3" aria-hidden="true" />
              {item.name}
            </Link>
          ))}
        </nav>
        {/* Separator for Go to Homepage and Logout */}
        <div className="mt-auto p-4 space-y-2 border-t border-gray-700">
          <Link
            to="/" // Link to the main homepage
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
      <main className="flex-grow p-6 md:p-8 overflow-auto">
        <Outlet /> {/* Child routes will render here */}
      </main>
    </div>
  );
};

export default AdminLayout;
