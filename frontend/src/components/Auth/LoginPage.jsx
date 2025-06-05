import { useNavigate } from 'react-router-dom';
import GoogleButton from './GoogleButton';
import LoginForm from './LoginForm';
// import api from '../../services/api'; // No longer directly calling api.post here
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, errorAuth } = useAuth(); // Get login function and errorAuth from context

  // Handle Google Login
  const handleGoogleLogin = () => {
    // This should also ideally use the backend base URL if it's absolute
    // For now, assuming proxy handles /auth/google if it's a backend route
    window.location.href = 'http://localhost:3001/api/auth/google'; // Make absolute if not using proxy for this
  };

  // Handle Local Login - Refactored to use AuthContext's login
  const handleLocalLogin = async (credentials) => {
    const loggedInUser = await login(credentials); // Call context's login function

    if (loggedInUser) {
      // login was successful, AuthContext has updated user state and localStorage
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      // login failed, errorAuth should be set in AuthContext
      // Throw an error to be caught by LoginForm.jsx's handleSubmit
      throw new Error(errorAuth || 'Login gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex bg-teraplus-page-bg"> {/* This will be white */}
      {/* Left Column: Illustration */}
      <div className="hidden lg:flex lg:w-3/5 xl:w-1/2 bg-teraplus-primary items-center justify-center p-12"> {/* White background */}
        <img 
          src="/images/bg-login.png" 
          alt="Sports Massage Therapy Illustration" 
          className="w-full max-w-2xl mx-auto object-contain" 
        />
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-2/5 xl:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12">
        {/* LoginForm provides its own card styling. The h2 title is now moved into LoginForm. */}
        <LoginForm onSubmit={handleLocalLogin} />
      </div>
    </div>
  );
}
