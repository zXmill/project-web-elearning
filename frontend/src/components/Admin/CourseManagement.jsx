import React, { useState, useEffect } from 'react';
import api, { BACKEND_URL } from '../../services/api'; // Import BACKEND_URL
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    imageSrc: '',
    area: '',
    syaratDanKetentuan: '',
    needsPreTest: true,
    prerequisites: [],
    slug: '' // Add slug to formData
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/courses');
      if (response.data?.status === 'success') {
        setCourses(response.data.data.courses);
      }
    } catch (err) {
      setError('Gagal mengambil data kursus');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submissionFormData = new FormData();
    
    // Append all text/data fields from formData state
    Object.keys(formData).forEach(key => {
      // For the 'imageSrc' key, only append it if no file is selected AND it has a value.
      // For all other keys, append them directly.
      if (key === 'imageSrc') {
        if (!selectedImageFile && formData.imageSrc) {
          submissionFormData.append(key, formData[key]);
        }
      } else {
        submissionFormData.append(key, formData[key]);
      }
    });

    // Append the image file if one is selected
    if (selectedImageFile) {
      submissionFormData.append('imageFile', selectedImageFile);
      // If a file is selected, the backend should prioritize it and generate the imageSrc.
      // Any manually entered formData.imageSrc would have been skipped by the loop above.
    }
    // No need for an 'else if' here to append formData.imageSrc, 
    // as the loop above handles appending it when selectedImageFile is null.

    try {
      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, submissionFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await api.post('/admin/courses', submissionFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      setShowModal(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menyimpan kursus');
      console.error(err);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // Clear manual imageSrc if a file is chosen
      setFormData(prev => ({ ...prev, imageSrc: '' })); 
    } else {
      setSelectedImageFile(null);
      setImagePreview('');
    }
  };
  
  const handleManualImageSrcChange = (e) => {
    setFormData({...formData, imageSrc: e.target.value});
    // If user types in URL, clear selected file and preview
    if (e.target.value) {
        setSelectedImageFile(null);
        setImagePreview('');
    }
  }

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      judul: course.judul || '',
      deskripsi: course.deskripsi || '',
      imageSrc: course.imageSrc || '', // This will be the existing relative URL or manual full URL
      area: course.area || '',
      syaratDanKetentuan: course.syaratDanKetentuan || '',
      needsPreTest: course.needsPreTest ?? true,
      prerequisites: course.prerequisites || [],
      slug: course.slug || '' // Populate slug on edit
    });
    setSelectedImageFile(null); // Clear any previously selected file for a new edit session
    
    // Set image preview for existing image
    if (course.imageSrc) {
      if (course.imageSrc.startsWith('http://') || course.imageSrc.startsWith('https://')) {
        setImagePreview(course.imageSrc); // Already a full URL
      } else {
        setImagePreview(`${BACKEND_URL}${course.imageSrc}`); // Prepend backend URL for relative paths
      }
    } else {
      setImagePreview(''); // No image
    }
    setShowModal(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kursus ini?')) {
      try {
        await api.delete(`/admin/courses/${courseId}`);
        fetchCourses();
      } catch (err) {
        setError('Gagal menghapus kursus');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      judul: '',
      deskripsi: '',
      imageSrc: '',
      area: '',
      syaratDanKetentuan: '',
      needsPreTest: true,
      prerequisites: [],
      slug: '' // Reset slug
    });
    setSelectedImageFile(null);
    setImagePreview('');
  };

  const openCreateModal = () => {
    resetForm(); // Resets formData, selectedImageFile, and imagePreview
    setEditingCourse(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Kursus</h2>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Tambah Kursus</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kursus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Area
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modul
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pre-Test
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-12 w-12 rounded-lg object-cover"
                      src={course.imageSrc ? (course.imageSrc.startsWith('http://') || course.imageSrc.startsWith('https://') ? course.imageSrc : `${BACKEND_URL}${course.imageSrc}`) : 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={course.judul}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{course.judul}</div>
                      <div className="text-sm text-gray-500">{course.deskripsi?.substring(0, 50)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {course.area || 'Semua Area'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {course.stats?.moduleCount || 0} modul
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    course.needsPreTest 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.needsPreTest ? 'Ya' : 'Tidak'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(course)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCourse ? 'Edit Kursus' : 'Tambah Kursus Baru'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Judul Kursus</label>
                  <input
                    type="text"
                    required
                    value={formData.judul}
                    onChange={(e) => setFormData({...formData, judul: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    placeholder="contoh: dasar-pijat-effleurage (otomatis dari judul jika kosong)"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Slug digunakan untuk URL. Jika dikosongkan, akan dibuat otomatis dari judul. Gunakan huruf kecil, angka, dan tanda hubung (-).</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea
                    rows={3}
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">URL Gambar</label>
                  <input
                    type="url"
                    value={formData.imageSrc}
                    onChange={handleManualImageSrcChange}
                    placeholder="https://example.com/image.jpg (atau unggah di bawah)"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!!selectedImageFile} // Disable if a file is chosen for upload
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unggah Gambar (opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-full file:border-0
                               file:text-sm file:font-semibold
                               file:bg-blue-50 file:text-blue-700
                               hover:file:bg-blue-100"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Pratinjau:</p>
                      <img src={imagePreview} alt="Pratinjau Gambar" className="h-32 w-auto rounded-md object-cover border" />
                    </div>
                  )}
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700">Area Tubuh</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Area</option>
                    <option value="Semua Area">Semua Area</option>
                    <option value="Betis (Depan-Belakang)">Betis (Depan-Belakang)</option>
                    <option value="Pundak Leher Bahu">Pundak Leher Bahu</option>
                    <option value="Pinggang Punggung">Pinggang Punggung</option>
                    <option value="Lengan">Lengan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Syarat & Ketentuan</label>
                  <textarea
                    rows={3}
                    value={formData.syaratDanKetentuan}
                    onChange={(e) => setFormData({...formData, syaratDanKetentuan: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.needsPreTest}
                    onChange={(e) => setFormData({...formData, needsPreTest: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Memerlukan Pre-Test
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingCourse ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
