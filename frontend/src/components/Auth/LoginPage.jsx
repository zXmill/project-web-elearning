import { useNavigate } from 'react-router-dom';
import GoogleButton from './GoogleButton';
import LoginForm from './LoginForm';
import api from '../../services/api'; // Corrected path: components/Auth -> services is ../../

export default function LoginPage() {
  const navigate = useNavigate();

  // Handle Google Login
  const handleGoogleLogin = () => {
    // This should also ideally use the backend base URL if it's absolute
    // For now, assuming proxy handles /auth/google if it's a backend route
    window.location.href = 'http://localhost:3001/api/auth/google'; // Make absolute if not using proxy for this
  };

  // Handle Local Login
  const handleLocalLogin = async (credentials) => {
    // The try-catch block for API errors is removed from here.
    // LoginForm.jsx's handleSubmit will now catch errors from api.post
    // and display them. This function will only handle the success case.

    const response = await api.post('/auth/login', credentials);

    // Axios response data is in response.data
    const data = response.data;

    // Store token and user email in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('userEmail', data.data.user.email); // Assuming structure is data.data.user.email
    localStorage.setItem('userName', data.data.user.name); // Store name as well
    localStorage.setItem('userRole', data.data.user.role); // Store role

    // Redirect based on role
    if (data.data.user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
    // If api.post('/auth/login', credentials) fails, it will throw an error.
    // This error will be caught by the handleSubmit function in LoginForm.jsx.
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
