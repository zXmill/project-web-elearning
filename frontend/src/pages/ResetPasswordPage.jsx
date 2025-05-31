import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password, passwordConfirm });
      if (response.data && response.data.status === 'success') {
        setMessage(response.data.message + ' Anda akan diarahkan ke halaman login.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Gagal mereset password.');
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || 'Token tidak valid, sudah kedaluwarsa, atau terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-teraplus-page-bg px-4 py-12">
      <div className="w-full max-w-md bg-teraplus-card-bg p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="TERAPLUS Logo" className="w-24 h-24 mx-auto mb-4 rounded-full" />
          <h1 className="text-2xl md:text-3xl font-bold text-teraplus-text-default">Reset Password Anda</h1>
          <p className="text-teraplus-text-default opacity-70 mt-2">
            Masukkan password baru Anda di bawah ini.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-teraplus-text-default mb-1">
              Password Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teraplus-primary focus:border-teraplus-primary sm:text-sm text-teraplus-text-default"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-teraplus-primary"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-teraplus-text-default mb-1">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teraplus-primary focus:border-teraplus-primary sm:text-sm text-teraplus-text-default"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-teraplus-primary"
                aria-label={showPasswordConfirm ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
              >
                {showPasswordConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !!message} // Disable if loading or success message is shown
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teraplus-brand-blue hover:bg-teraplus-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teraplus-brand-blue disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>
        {message && (
             <div className="mt-6 text-center">
                <Link to="/login" className="font-medium text-teraplus-primary hover:text-teraplus-accent hover:underline">
                    Kembali ke Login
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
