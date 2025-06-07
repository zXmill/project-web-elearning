import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import useAuth instead of AuthContext
import { CourseProgressProvider } from './contexts/CourseProgressContext'; // Import CourseProgressProvider
import Login from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import UserProfilePage from './pages/UserProfilePage';
import CompleteProfilePage from './pages/CompleteProfilePage';
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
import CertificatePage from './pages/CertificatePage'; // Import CertificatePage
import ModuleListPage from './pages/ModuleListPage'; // Import ModuleListPage
import CourseManagement from './components/Admin/CourseManagement'; // Import CourseManagement for admin courses
import AdminContentPage from './pages/AdminContentPage'; // Import AdminContentPage

// Placeholder Admin Pages for routing
const AdminContent = AdminContentPage;
const AdminSettings = () => <div className="p-6 bg-white rounded-lg shadow-md"><h1 className="text-2xl font-semibold">Admin Settings</h1><p className="mt-2 text-gray-600">Various admin-specific settings will be configured here.</p></div>;

function ProfileCompletionGuard({ children }) {
  const { user, loadingAuth } = useAuth(); // Destructure loadingAuth

  if (loadingAuth) {
    // Display a loading indicator while authentication check is in progress
    return <div className="flex justify-center items-center min-h-screen">Loading user data...</div>;
  }

  // PrivateRoute (which wraps this guard) is responsible for handling unauthenticated users.
  // This guard operates on the assumption that 'user' is populated if authenticated.
  if (user && (!user.affiliasi || !user.noHp)) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}

export default function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.dispatchEvent(new CustomEvent('auth-token-processed')); // Dispatch custom event
      window.history.replaceState({}, document.title, '/'); // Hapus token dari URL
    }
  }, []);

  return (
    <AuthProvider>
      <CourseProgressProvider> {/* Wrap BrowserRouter with CourseProgressProvider */}
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/complete-profile" 
              element={
                <PrivateRoute>
                  <CompleteProfilePage />
                </PrivateRoute>
              } 
            />
            <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/auth-redirect" element={<AuthRedirect />} />
            
            {/* User Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <ProfileCompletionGuard>
                    <UserLayout>
                      <Home />
                    </UserLayout>
                  </ProfileCompletionGuard>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfileCompletionGuard>
                    <UserLayout>
                      <UserProfilePage />
                    </UserLayout>
                  </ProfileCompletionGuard>
                </PrivateRoute>
              }
            />
            <Route
              path="/course/:identifier" // Changed courseId to identifier
              element={
                <PrivateRoute>
                  <ProfileCompletionGuard>
                    <UserLayout>
                      <CourseDetailPage />
                    </UserLayout>
                  </ProfileCompletionGuard>
                </PrivateRoute>
              }
            />
            {/* New Module List Page Route */}
            <Route
              path="/course/:identifier/moduleslist" // Changed courseId to identifier and path to /course/
              element={
                <PrivateRoute>
                  <ProfileCompletionGuard>
                    <UserLayout>
                      <ModuleListPage />
                    </UserLayout>
                  </ProfileCompletionGuard>
                </PrivateRoute>
              }
            />
            {/* Pre-Test Route */}
            <Route
              path="/course/:identifier/pretest" // Changed courseId to identifier
              element={
                <PrivateRoute>
                  <ProfileCompletionGuard>
                    <UserLayout>
                      <PreTestPage />
                    </UserLayout>
                  </ProfileCompletionGuard>
                </PrivateRoute>
              }
            />
            {/* Pre-Test Result Route */}
            <Route
              path="/course/:identifier/pretest-result" // Changed courseId to identifier
              element={
                <PrivateRoute>
                  <ProfileCompletionGuard>
                    <UserLayout>
                      <PreTestResultPage />
                    </UserLayout>
                  </ProfileCompletionGuard>
                </PrivateRoute>
              }
            />
            {/* Course Content Route - Now uses moduleOrder */}
            <Route
              path="/course/:identifier/content/:moduleOrder" 
              element={
                <PrivateRoute>
                  <ProfileCompletionGuard>
                    <UserLayout>
                      <CourseContentPage />
                    </UserLayout>
                  </ProfileCompletionGuard>
                </PrivateRoute>
              }
            />
            {/* Fallback/Redirect if no moduleOrder is specified. 
                CourseContentPage itself will handle redirection to the correct module by its order. */}
            <Route
              path="/course/:identifier/content" 
              element={
                <PrivateRoute>
                  <ProfileCompletionGuard>
                    <UserLayout>
                      <CourseContentPage /> 
                    </UserLayout>
                  </ProfileCompletionGuard>
                </PrivateRoute>
              }
            />
            {/* Post-Test Route */}
            <Route
              path="/course/:identifier/posttest" // Changed courseId to identifier
              element={
                <PrivateRoute>
                  <ProfileCompletionGuard>
                    <UserLayout>
                      <PostTestPage />
                    </UserLayout>
                  </ProfileCompletionGuard>
                </PrivateRoute>
              }
            />
            {/* Post-Test Result Route */}
            <Route
              path="/course/:identifier/posttest-result" // Changed courseId to identifier
              element={
                <PrivateRoute>
                  <ProfileCompletionGuard>
                    <UserLayout>
                      <PostTestResultPage />
                    </UserLayout>
                  </ProfileCompletionGuard>
                </PrivateRoute>
              }
            />
            {/* Certificate Page Route */}
            <Route
              path="/course/:identifier/certificate" // Changed courseId to identifier
              element={
                <PrivateRoute>
                  <ProfileCompletionGuard>
                    <UserLayout>
                      <CertificatePage />
                    </UserLayout>
                  </ProfileCompletionGuard>
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
      </CourseProgressProvider>
    </AuthProvider> 
  );
}
