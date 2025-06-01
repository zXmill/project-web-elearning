import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext'; // Corrected Import AuthProvider
import Login from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import UserProfilePage from './pages/UserProfilePage';
import RequestPasswordResetPage from './pages/RequestPasswordResetPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/Auth/PrivateRoute';
import AuthRedirect from './pages/AuthRedirect';
import UserLayout from './components/Layout/UserLayout';
import AdminLayout from './components/Layout/AdminLayout';
import AdminRoute from './components/Auth/AdminRoute';
import AdminUsersPage from './pages/AdminUsersPage';
import CourseDetailPage from './pages/CourseDetailPage';
import PreTestPage from './pages/PreTestPage';
import PreTestResultPage from './pages/PreTestResultPage'; // Added PreTestResultPage
import CourseContentPage from './pages/CourseContentPage';
import PostTestPage from './pages/PostTestPage'; // Import PostTestPage
import PostTestResultPage from './pages/PostTestResultPage'; // Import PostTestResultPage
import CourseManagement from './components/Admin/CourseManagement'; // Import CourseManagement for admin courses
import AdminContentPage from './pages/AdminContentPage'; // Import AdminContentPage

// Placeholder Admin Pages for routing
const AdminContent = AdminContentPage;
const AdminSettings = () => <div className="p-6 bg-white rounded-lg shadow-md"><h1 className="text-2xl font-semibold">Admin Settings</h1><p className="mt-2 text-gray-600">Various admin-specific settings will be configured here.</p></div>;

export default function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, '/'); // Hapus token dari URL
    }
  }, []);

  return (
    <AuthProvider> {/* Wrap BrowserRouter with AuthProvider */}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/auth-redirect" element={<AuthRedirect />} />
          
          {/* User Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <UserLayout>
                  <Home />
                </UserLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserLayout>
                  <UserProfilePage />
                </UserLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <PrivateRoute>
                <UserLayout>
                  <CourseDetailPage />
                </UserLayout>
              </PrivateRoute>
            }
          />
          {/* Pre-Test Route */}
          <Route
            path="/course/:courseId/pretest"
            element={
            <PrivateRoute>
              <UserLayout>
                <PreTestPage />
              </UserLayout>
            </PrivateRoute>
          }
        />
        {/* Pre-Test Result Route */}
        <Route
            path="/course/:courseId/pretest-result"
            element={
            <PrivateRoute>
              <UserLayout>
                <PreTestResultPage />
              </UserLayout>
            </PrivateRoute>
          }
        />
        {/* Course Content Route */}
        <Route
          path="/course/:courseId/content" // General content page
          element={
            <PrivateRoute>
              <UserLayout>
                <CourseContentPage />
              </UserLayout>
            </PrivateRoute>
          }
        />
        {/* Optional: Route for specific module ID if needed later */}
        {/* <Route
          path="/course/:courseId/content/:moduleId" 
          element={
            <PrivateRoute>
              <UserLayout>
                <CourseContentPage />
              </UserLayout>
            </PrivateRoute>
          }
        /> */}
        {/* Post-Test Route */}
        <Route
          path="/course/:courseId/posttest"
          element={
            <PrivateRoute>
              <UserLayout>
                <PostTestPage />
              </UserLayout>
            </PrivateRoute>
          }
        />
        {/* Post-Test Result Route */}
        <Route
          path="/course/:courseId/posttest-result"
          element={
            <PrivateRoute>
              <UserLayout>
                <PostTestResultPage />
              </UserLayout>
            </PrivateRoute>
          }
        />
        
        {/* Admin Routes - Protected by AdminRoute and using AdminLayout */}
        <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} /> 
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="courses" element={<CourseManagement />} /> {/* Replace placeholder with CourseManagement component */}
              <Route path="content" element={<AdminContent />} />
              <Route path="settings" element={<AdminSettings />} />
              {/* Add other nested admin routes here as needed */}
            </Route>
          </Route>

          {/* Fallback for unmatched routes (optional but good practice) */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
              <h2 className="text-4xl font-bold text-gray-700 mb-4">404 - Page Not Found</h2>
              <p className="text-gray-600 mb-8">Sorry, the page you are looking for does not exist.</p>
              <a href="/" className="px-6 py-3 bg-teraplus-brand-blue text-white rounded-lg hover:bg-teraplus-brand-blue-dark transition-colors">
                Go to Homepage
              </a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider> 
  );
}
