import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token'); // Ganti sesuai cara simpan token-mu
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}