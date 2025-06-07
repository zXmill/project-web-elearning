import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import RegisterForm from '../components/Auth/RegisterForm';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    password: '',
    confirmPassword: '',
    affiliasi: '', // Added affiliasi
    noHp: '',      // Added noHp
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    try {
      // Use the imported api instance
      const response = await api.post('/auth/register', { 
        namaLengkap: formData.namaLengkap,
        email: formData.email,
        password: formData.password,
        affiliasi: formData.affiliasi, // Added affiliasi
        noHp: formData.noHp,          // Added noHp
      });

      // Axios response data is directly in response.data
      const data = response.data;

      // Axios throws an error for non-2xx responses, so response.ok check is not standard here
      // Instead, rely on try/catch for error handling from Axios
      // However, if the backend sends a success status with an error message in data:
      if (data.error) { // Assuming backend might send { error: "message" } on logical failure with 200
          throw new Error(data.message || 'Registrasi gagal');
      }
      if (response.status !== 201 && response.status !== 200) { // Check for explicit success codes if needed
        // This check might be redundant if backend consistently uses HTTP error codes for errors
        throw new Error(data.message || `Registrasi gagal dengan status: ${response.status}`);
      }
      
      setSuccess(data.message || 'Registrasi berhasil! Anda akan diarahkan ke halaman login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redirect after 2 seconds

    } catch (err) {
      // Prefer server's error message if available from Axios response
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat registrasi.');
    }
  };

  return (
    <div className="min-h-screen flex bg-teraplus-page-bg">
      {/* Left Column: Illustration */}
      <div className="hidden lg:flex lg:w-3/5 xl:w-1/2 bg-teraplus-primary items-center justify-center p-12">
        <img 
          src="/images/bg-login.png" 
          alt="Sports Massage Therapy Illustration" 
          className="w-full max-w-2xl mx-auto object-contain" 
        />
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-2/5 xl:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12">
        <RegisterForm 
          onSubmit={handleSubmit}
          formData={formData}
          handleChange={handleChange}
          error={error}
          success={success}
        />
      </div>
    </div>
  );
};

export default RegisterPage;
