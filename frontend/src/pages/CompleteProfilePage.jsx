import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const CompleteProfilePage = () => {
  const { setUser } = useAuth(); // Get setUser from AuthContext
  const [formData, setFormData] = useState({
    namaLengkap: '',
    affiliasi: '',
    noHp: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user profile to prefill if available
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        const user = response.data.data.user;
        if (user.namaLengkap) setFormData(prev => ({ ...prev, namaLengkap: user.namaLengkap })); // Prefill namaLengkap
        if (user.affiliasi) setFormData(prev => ({ ...prev, affiliasi: user.affiliasi }));
        if (user.noHp) setFormData(prev => ({ ...prev, noHp: user.noHp }));
        setLoading(false);
      } catch (err) {
        setError('Gagal mengambil data profil.');
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.namaLengkap.trim() || !formData.affiliasi.trim() || !formData.noHp.trim()) { // Added namaLengkap to validation
      setError('Nama Lengkap, Affiliasi, dan No HP harus diisi.');
      return;
    }

    try {
      const response = await api.put('/auth/profile', { // Capture the response
        namaLengkap: formData.namaLengkap.trim(),
        affiliasi: formData.affiliasi.trim(),
        noHp: formData.noHp.trim(),
      });
      if (response.data && response.data.status === 'success' && response.data.data.user) {
        setUser(response.data.data.user); // Update user in AuthContext
        // Also update localStorage for userName if it changed, to keep Header consistent
        if (response.data.data.user.namaLengkap) {
            localStorage.setItem('userName', response.data.data.user.namaLengkap);
        }
        // Optionally, update other localStorage items if they are part of the response and might change
        // localStorage.setItem('userEmail', response.data.data.user.email); 
        // localStorage.setItem('userRole', response.data.data.user.role);
        
        // Dispatch an event to notify other components (like Header) that user data might have changed
        // This is useful if other components rely on localStorage directly for some parts of user info
        window.dispatchEvent(new CustomEvent('auth-profile-updated'));

        navigate('/'); // Redirect to homepage after successful update
      } else {
        // Handle cases where API call might "succeed" (2xx) but not return expected data
        setError(response.data?.message || 'Gagal memperbarui profil: Respon tidak sesuai.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui profil.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-teraplus-page-bg p-6">
      <form onSubmit={handleSubmit} className="bg-teraplus-card-bg p-8 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-teraplus-text-default">Lengkapi Profil Anda</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="namaLengkap" className="block mb-1 text-teraplus-text-default font-medium">Nama Lengkap</label>
          <input
            id="namaLengkap"
            name="namaLengkap"
            type="text"
            value={formData.namaLengkap}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-teraplus-brand-blue focus:border-teraplus-brand-blue"
            placeholder="Masukkan nama lengkap Anda"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="affiliasi" className="block mb-1 text-teraplus-text-default font-medium">Affiliasi (Nama Instansi/Perusahaan/Pribadi)</label>
          <input
            id="affiliasi"
            name="affiliasi"
            type="text"
            value={formData.affiliasi}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-teraplus-brand-blue focus:border-teraplus-brand-blue"
            placeholder="Masukkan affiliasi Anda"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="noHp" className="block mb-1 text-teraplus-text-default font-medium">No. HP (WhatsApp Aktif)</label>
          <input
            id="noHp"
            name="noHp"
            type="tel"
            value={formData.noHp}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-teraplus-brand-blue focus:border-teraplus-brand-blue"
            placeholder="Contoh: 081234567890"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-teraplus-accent text-teraplus-primary font-semibold rounded hover:bg-teraplus-accent-dark transition"
        >
          Simpan
        </button>
      </form>
    </div>
  );
};

export default CompleteProfilePage;
