import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; 
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const RequestPasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await api.post('/auth/request-password-reset', { email });
      if (response.data && response.data.status === 'success') {
        setMessage(response.data.message);
      } else {
        setError(response.data.message || 'Gagal mengirim permintaan reset password.');
      }
    } catch (err) {
      console.error("Request password reset error:", err);
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-teraplus-page-bg px-4 py-12">
      <div className="w-full max-w-md bg-teraplus-card-bg p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="TERAPLUS Logo" className="w-24 h-24 mx-auto mb-4 rounded-full" />
          <h1 className="text-2xl md:text-3xl font-bold text-teraplus-text-default">Lupa Password?</h1>
          <p className="text-teraplus-text-default opacity-70 mt-2">
            Masukkan alamat email Anda di bawah ini. Jika terdaftar, kami akan mengirimkan instruksi untuk mereset password Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-teraplus-text-default mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teraplus-primary focus:border-teraplus-primary sm:text-sm text-teraplus-text-default"
                placeholder="you@example.com"
              />
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
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teraplus-brand-blue hover:bg-teraplus-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teraplus-brand-blue disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Kirim Instruksi Reset'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-teraplus-text-default opacity-80">
            Ingat password Anda?{' '}
            <Link to="/login" className="font-medium text-teraplus-brand-blue hover:text-teraplus-brand-blue-dark hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestPasswordResetPage;
