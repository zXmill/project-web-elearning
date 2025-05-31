import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import api from '../services/api';
import { UserCircleIcon, EnvelopeIcon, CalendarDaysIcon, IdentificationIcon, CameraIcon, ArrowUpTrayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'; // Added ArrowLeftIcon
import useAuth from '../hooks/useAuth'; // Import useAuth to update global state

const UserProfilePage = () => {
  const { user: authUser, setUser: setAuthUser, loading: authLoading } = useAuth(); // Get user and setUser from useAuth
  const [user, setUser] = useState(null); // Local user state for this page
  const [namaLengkap, setNamaLengkap] = useState('');
  const [loading, setLoading] = useState(true); // General loading for page data
  const [uploading, setUploading] = useState(false); // Specific loading for image upload
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSource, setPreviewSource] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        const response = await api.get('/auth/profile');
        if (response.data && response.data.status === 'success') {
          setUser(response.data.data.user);
          setNamaLengkap(response.data.data.user.namaLengkap);
          if (response.data.data.user.profilePicture) {
            // Assuming backend serves files from root, adjust if API_URL is needed
            setPreviewSource(response.data.data.user.profilePicture.startsWith('http') ? response.data.data.user.profilePicture : `${api.defaults.baseURL.replace('/api', '')}${response.data.data.user.profilePicture}`);
          }
        } else {
          setError('Gagal mengambil data profil pengguna.');
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.response?.data?.message || 'Terjadi kesalahan server. Coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!namaLengkap.trim()) {
        setError('Nama lengkap tidak boleh kosong.');
        return;
    }
    try {
      setLoading(true);
      const response = await api.put('/auth/profile', { namaLengkap: namaLengkap.trim() });
      if (response.data && response.data.status === 'success') {
        setUser(response.data.data.user);
        setNamaLengkap(response.data.data.user.namaLengkap);
        localStorage.setItem('userName', response.data.data.user.namaLengkap); // Update localStorage if name is stored there
        setSuccessMessage('Profil berhasil diperbarui!');
      } else {
        setError(response.data.message || 'Gagal memperbarui profil.');
      }
    } catch (err) {
      console.error("Error updating user profile:", err);
      setError(err.response?.data?.message || 'Terjadi kesalahan server saat memperbarui.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPreviewSource(reader.result);
      };
      setError(''); // Clear previous errors
      setSuccessMessage('');
    }
  };

  const handlePictureUpload = async () => {
    if (!selectedFile) {
      setError('Pilih file gambar terlebih dahulu.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setUploading(true);

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      const response = await api.post('/auth/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.status === 'success') {
        const updatedUser = response.data.data.user;
        setUser(updatedUser); // Update local page user state
        // Update global auth context
        setAuthUser(prevAuthUser => ({ ...prevAuthUser, profilePicture: updatedUser.profilePicture }));
        
        // Update preview source to the new server path
        setPreviewSource(updatedUser.profilePicture.startsWith('http') ? updatedUser.profilePicture : `${api.defaults.baseURL.replace('/api', '')}${updatedUser.profilePicture}`);
        setSelectedFile(null); // Clear selected file
        setSuccessMessage('Foto profil berhasil diunggah!');
      } else {
        setError(response.data.message || 'Gagal mengunggah foto profil.');
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError(err.response?.data?.message || 'Terjadi kesalahan server saat mengunggah.');
    } finally {
      setUploading(false);
    }
  };


  if (loading && !user) { // Show full page loader only on initial load
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teraplus-primary"></div>
      </div>
    );
  }

  if (error && !user && !uploading) { // Show full page error only if user data couldn't be fetched and not during upload
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
        <div className="container mx-auto px-4 py-8 text-center text-gray-500">
            Tidak dapat memuat profil pengguna.
        </div>
    );
  }
  
  const currentProfilePic = user.profilePicture 
    ? (user.profilePicture.startsWith('http') ? user.profilePicture : `${api.defaults.baseURL.replace('/api', '')}${user.profilePicture}`)
    : null;

  return (
    <div className="min-h-screen bg-gray-100 py-8"> {/* Added bg-gray-100 and min-h-screen for full page background */}
      <div className="container mx-auto px-4 max-w-2xl"> {/* Original container for content alignment */}
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 text-sm font-medium group">
          <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Kembali ke Beranda
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center md:text-left">Profil Saya</h1> {/* Centered heading on small screens */}

        {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {previewSource ? (
              <img src={previewSource} alt="Pratinjau Profil" className="h-32 w-32 rounded-full object-cover shadow-md" />
            ) : currentProfilePic ? (
              <img src={currentProfilePic} alt="Profil" className="h-32 w-32 rounded-full object-cover shadow-md" />
            ) : (
              <UserCircleIcon className="h-32 w-32 text-gray-300" />
            )}
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="absolute -bottom-2 -right-2 bg-teraplus-accent hover:bg-teraplus-primary-darker text-white p-2 rounded-full shadow-md transition-colors"
              title="Ubah foto profil"
            >
              <CameraIcon className="h-5 w-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png"
              className="hidden"
            />
          </div>
          {selectedFile && (
            <div className="mt-4 flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-2">File dipilih: {selectedFile.name}</p>
              <button
                onClick={handlePictureUpload}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teraplus-accent hover:bg-teraplus-primary-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teraplus-accent disabled:opacity-50 transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                    Unggah Foto Profil
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3">
             {/* Icon can be removed if profile pic is prominent enough, or kept */}
            <UserCircleIcon className="h-8 w-8 text-teraplus-primary" />
            <div>
              <p className="text-sm text-gray-500">Nama Lengkap</p>
              <p className="text-lg font-semibold text-gray-700">{user.namaLengkap}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-7 w-7 text-teraplus-primary" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg text-gray-700">{user.email}</p>
            </div>
          </div>
          {/* Role section removed as per user request */}
          <div className="flex items-center space-x-3">
            <CalendarDaysIcon className="h-7 w-7 text-teraplus-primary" />
            <div>
              <p className="text-sm text-gray-500">Tanggal Bergabung</p>
              <p className="text-lg text-gray-700">{new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <hr className="my-8" />

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Ubah Nama Lengkap</h2>
          <div>
            <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap Baru
            </label>
            <input
              type="text"
              id="namaLengkap"
              name="namaLengkap"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teraplus-primary focus:border-teraplus-primary sm:text-sm"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teraplus-accent hover:bg-teraplus-primary-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teraplus-accent disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
};

export default UserProfilePage;
