import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    // Authenticated but not an admin, redirect to home or a "Not Authorized" page
    // For simplicity, redirecting to home.
    // You could create a specific "Not Authorized" component/page.
    alert('Anda tidak memiliki izin untuk mengakses halaman ini.');
    return <Navigate to="/" replace />;
  }

  // Authenticated and is an admin, render the child routes (Outlet)
  return <Outlet />;
};

export default AdminRoute;
