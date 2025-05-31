import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import api from '../services/api';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('deskripsi'); // 'deskripsi' or 'syarat'

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/courses/${courseId}`);
        
        // Check if response and expected data structure are present
        if (response.data && response.data.status === 'success' && response.data.data && response.data.data.course) {
          const fetchedCourse = response.data.data.course;
          setCourse({
            ...fetchedCourse,
            // Provide robust fallbacks for potentially missing fields
            deskripsiLengkap: fetchedCourse.deskripsi || "Deskripsi lengkap tidak tersedia.", 
            syaratKetentuan: fetchedCourse.syarat_ketentuan || "Syarat & ketentuan tidak tersedia.", 
            // Ensure 'deskripsi' is a string before calling substring, or provide a direct fallback
            shortDescriptionSidebar: fetchedCourse.deskripsi_singkat_sidebar || 
                                     (typeof fetchedCourse.deskripsi === 'string' ? fetchedCourse.deskripsi.substring(0,100) + "..." : "Info singkat kursus.")
          });
        } else if (response.data && response.data.status === 'fail') {
          // Handle cases where the API explicitly says 'fail' (e.g., course not found by backend controller)
           setError(response.data.message || 'Kursus tidak ditemukan.');
           setCourse(null); // Ensure course is null if not found
        }
        else {
          // Handle other unexpected response structures
          setError('Gagal mengambil detail kursus atau format respons tidak sesuai.');
          setCourse(null);
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        // If the error object has a response from the server (e.g., 404, 500 from backend)
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Terjadi kesalahan saat menghubungi server.');
        }
        setCourse(null); // Ensure course is null on error
        setError(err.response?.data?.message || 'Terjadi kesalahan server.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teraplus-accent"></div>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  if (!course) {
    return <div className="container mx-auto px-4 py-8 text-center">Kursus tidak ditemukan.</div>;
  }

  // TODO: Implement the full UI as per the design image
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-teraplus-text-default mb-6">{course.judul}</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Image and Tabs */}
        <div className="lg:w-2/3">
          <img src={course.imageSrc} alt={course.judul} className="w-full rounded-lg shadow-lg mb-6" />
          
          <div className="mb-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('deskripsi')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'deskripsi' 
                    ? 'border-teraplus-accent text-teraplus-accent' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Deskripsi
              </button>
              <button
                onClick={() => setActiveTab('syarat')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'syarat' 
                    ? 'border-teraplus-accent text-teraplus-accent' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Syarat & Ketentuan
              </button>
            </nav>
          </div>
          <div>
            {activeTab === 'deskripsi' && (
              <div className="prose max-w-none text-teraplus-text-default">
                <p>{course.deskripsiLengkap}</p>
              </div>
            )}
            {activeTab === 'syarat' && (
              <div className="prose max-w-none text-teraplus-text-default">
                <p>{course.syaratKetentuan}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-teraplus-text-default mb-3">{course.judul}</h2>
            <p className="text-sm text-gray-600 mb-6">
              {course.shortDescriptionSidebar}
            </p>
            <button 
              className="w-full bg-teraplus-accent text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-teraplus-accent focus:ring-opacity-50"
              onClick={() => {
                if (course && course.needsPreTest) {
                  navigate(`/course/${courseId}/pretest`);
                } else {
                  // Placeholder for actual course start logic if no pre-test
                  alert('Mulai Course Clicked! (No Pre-Test)');
                }
              }}
            >
              {course && course.needsPreTest ? 'Mulai Pre-Test' : 'Mulai Course'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
