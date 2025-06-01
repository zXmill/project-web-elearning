import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ModuleManagement from '../components/Admin/ModuleManagement';

const AdminContentPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/admin/courses');
        if (res.data?.status === 'success') {
          setCourses(res.data.data.courses);
          if (res.data.data.courses.length > 0) {
            setSelectedCourseId(res.data.data.courses[0].id.toString());
          }
        } else {
          setError('Gagal mengambil data kursus');
        }
      } catch (err) {
        setError('Gagal mengambil data kursus');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kursus</label>
        <select
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={selectedCourseId}
          onChange={e => setSelectedCourseId(e.target.value)}
        >
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.judul}</option>
          ))}
        </select>
      </div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : (
        selectedCourseId && <ModuleManagement courseId={selectedCourseId} />
      )}
    </div>
  );
};

export default AdminContentPage;
