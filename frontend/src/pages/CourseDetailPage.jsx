import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCourseProgress } from '../contexts/CourseProgressContext';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    modules: contextModules, // Renamed to avoid conflict with course.modules if any
    isModuleCompleted,
    isPreTestCompleted: contextIsPreTestCompleted, // Use this from context
    fetchCourseProgressAndModules,
    getFirstIntroModule,
    getPreTestModule,
    isLoading: progressLoading,
    error: progressError,
    resetProgressForCourse,
    completedModules, // Destructure completedModules
  } = useCourseProgress();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true); // For course detail fetching
  const [error, setError] = useState(''); // For course detail fetching
  const [activeTab, setActiveTab] = useState('deskripsi');
  const [isEnrolling, setIsEnrolling] = useState(false);

  const [certificateEligible, setCertificateEligible] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState('');
  const [eligibilityReasons, setEligibilityReasons] = useState([]);


  useEffect(() => {
    // Reset progress when component unmounts or courseId changes before fetching new
    return () => {
      if (courseId) { // Only reset if there was a courseId context
        // resetProgressForCourse(); // Decided to manage this via fetchCourseProgressAndModules itself
      }
    };
  }, [courseId]);


  useEffect(() => {
    const fetchDetailsAndProgress = async () => {
      if (courseId && user) {
        setLoading(true); // For course details
        setError('');
        try {
          // Fetch course details
          const response = await api.get(`/courses/${courseId}`);
          if (response.data && response.data.status === 'success' && response.data.data && response.data.data.course) {
            const fetchedCourse = response.data.data.course;
            setCourse({
              ...fetchedCourse,
              deskripsiLengkap: fetchedCourse.deskripsi || "Deskripsi lengkap tidak tersedia.",
              syaratKetentuan: fetchedCourse.syarat_ketentuan || "Syarat & ketentuan tidak tersedia.",
              shortDescriptionSidebar: fetchedCourse.deskripsi_singkat_sidebar ||
                                       (typeof fetchedCourse.deskripsi === 'string' ? fetchedCourse.deskripsi.substring(0, 100) + "..." : "Info singkat kursus.")
            });
            // After setting course, fetch progress (which also fetches modules)
            await fetchCourseProgressAndModules(courseId);
          } else {
            setError(response.data?.message || 'Kursus tidak ditemukan atau format respons tidak sesuai.');
            setCourse(null);
          }
        } catch (err) {
          console.error("Error fetching course details:", err);
          setError(err.response?.data?.message || 'Terjadi kesalahan saat menghubungi server.');
          setCourse(null);
        } finally {
          setLoading(false);
        }
      } else if (courseId && !user) {
        // Fetch public course details if user not logged in
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/courses/${courseId}`);
            if (response.data && response.data.status === 'success' && response.data.data && response.data.data.course) {
                const fetchedCourse = response.data.data.course;
                setCourse({ /* ... set course data ... */ });
            } else { /* ... handle error ... */ }
        } catch (err) { /* ... handle error ... */ }
        finally { setLoading(false); }
        resetProgressForCourse(); // No user, so reset any lingering progress state
      }
    };

    fetchDetailsAndProgress();
  }, [courseId, user, fetchCourseProgressAndModules, resetProgressForCourse]);


  // Certificate Eligibility Check (using contextModules if available)
  useEffect(() => {
    const checkEligibility = async () => {
      if (courseId && user) {
        setEligibilityLoading(true);
        setEligibilityError('');
        setEligibilityReasons([]);
        try {
          const response = await api.get(`/courses/${courseId}/certificate/eligibility`);
          if (response.data && response.data.status === 'success') {
            setCertificateEligible(response.data.eligible);
            if (!response.data.eligible && response.data.reasons) {
              // TODO: Sort reasons by module order if backend doesn't
              // This requires having module details (order) for each reason's module ID
              // For now, displaying as received.
              setEligibilityReasons(response.data.reasons);
            }
          } else {
            setEligibilityError(response.data.message || 'Gagal memeriksa kelayakan sertifikat.');
          }
        } catch (err) {
          console.error("Error checking certificate eligibility:", err);
          setEligibilityError(err.response?.data?.message || 'Terjadi kesalahan saat memeriksa kelayakan sertifikat.');
        } finally {
          setEligibilityLoading(false);
          setEligibilityChecked(true);
        }
      } else {
        setEligibilityChecked(false);
      }
    };
    if (courseId && user) {
      checkEligibility();
    }
  }, [courseId, user, contextModules, completedModules]); // Use completedModules in dependency array

  const handleDownloadCertificate = async () => {
    // ... (handleDownloadCertificate implementation remains the same)
    try {
      const response = await api.get(`/courses/${courseId}/certificate/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let filename = `sertifikat-${course?.judul?.replace(/\s+/g, '_') || 'kursus'}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch.length === 2) filename = filenameMatch[1];
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading certificate:", err);
      alert('Gagal mengunduh sertifikat. Pastikan Anda memenuhi syarat.');
      // ... (error parsing logic remains same)
    }
  };

  const firstIntroModule = useMemo(() => getFirstIntroModule(), [contextModules, getFirstIntroModule]);
  const preTestModule = useMemo(() => getPreTestModule(), [contextModules, getPreTestModule]);

  const isFirstIntroCompleted = useMemo(() => {
    return firstIntroModule ? isModuleCompleted(firstIntroModule.id) : true; // Assume completed if no intro module
  }, [firstIntroModule, isModuleCompleted]);

  // Button logic determination
  let buttonText = 'Memuat...';
  let buttonAction = () => {};

  if (!user) {
    buttonText = 'Login untuk Memulai';
    buttonAction = () => navigate('/login');
  } else if (progressLoading || loading) { // loading is for course details
    buttonText = 'Memuat...';
  } else if (course) { // Ensure course data and progress data are loaded
    if (firstIntroModule && !isFirstIntroCompleted) {
      buttonText = 'Baca Pendahuluan';
      buttonAction = async () => {
        setIsEnrolling(true);
        try {
          await api.post(`/courses/${courseId}/enroll`);
          navigate(`/course/${courseId}/content/${firstIntroModule.id}`);
        } catch (err) {
          if (err.response && err.response.status === 409) { // Already enrolled
            navigate(`/course/${courseId}/content/${firstIntroModule.id}`);
          } else {
            alert('Gagal memulai kursus. Silakan coba lagi.');
          }
        } finally {
          setIsEnrolling(false);
        }
      };
    } else if (preTestModule && !contextIsPreTestCompleted) {
      buttonText = 'Mulai Pre-Test';
      buttonAction = async () => {
        setIsEnrolling(true);
        try {
          await api.post(`/courses/${courseId}/enroll`);
          navigate(`/course/${courseId}/pretest`); // Navigate to dedicated pre-test route
        } catch (err) {
          if (err.response && err.response.status === 409) { // Already enrolled
             navigate(`/course/${courseId}/pretest`);
          } else {
            alert('Gagal memulai pre-test. Silakan coba lagi.');
          }
        } finally {
          setIsEnrolling(false);
        }
      };
    } else {
      buttonText = 'Lanjutkan Kursus';
      buttonAction = async () => {
        setIsEnrolling(true);
        try {
          await api.post(`/courses/${courseId}/enroll`);
          // Navigate to main content page, it will handle resuming
          navigate(`/course/${courseId}/content`); 
        } catch (err) {
           if (err.response && err.response.status === 409) { // Already enrolled
             navigate(`/course/${courseId}/content`);
          } else {
            alert('Gagal melanjutkan kursus. Silakan coba lagi.');
          }
        } finally {
          setIsEnrolling(false);
        }
      };
    }
  } else if (error || progressError) {
      buttonText = "Gagal Memuat Kursus";
      buttonAction = () => window.location.reload(); // Or some other error action
  }


  if (loading && !course) { // Initial loading for course details
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teraplus-accent"></div>
      </div>
    );
  }

  if (error && !course) { // Error fetching course details and no course data
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }
  
  if (!course && !loading) { // No course found and not loading
    return <div className="container mx-auto px-4 py-8 text-center">Kursus tidak ditemukan.</div>;
  }
  
  // Render progressError if it exists and course details might have loaded
  if (progressError && course) {
      // You might want to display this error more gracefully within the page layout
      console.error("Course Progress Error:", progressError);
      // alert(`Masalah dengan progres kursus: ${progressError}`);
  }


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
              className="w-full bg-teraplus-accent text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-teraplus-accent focus:ring-opacity-50 mb-4"
              disabled={isEnrolling || progressLoading || loading || (!user && buttonText !== 'Login untuk Memulai')}
              onClick={buttonAction}
            >
              {isEnrolling ? 'Memproses...' : buttonText}
            </button>

            {/* Certificate Section */}
            {user && eligibilityChecked && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-teraplus-text-default mb-2">Sertifikat</h3>
                {eligibilityLoading && <p className="text-sm text-gray-500">Memeriksa kelayakan...</p>}
                {eligibilityError && <p className="text-sm text-red-500">{eligibilityError}</p>}
                {!eligibilityLoading && !eligibilityError && (
                  certificateEligible ? (
                    <button
                      onClick={handleDownloadCertificate}
                      className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                      Unduh Sertifikat
                    </button>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Anda belum memenuhi syarat untuk sertifikat.</p>
                      {eligibilityReasons.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-gray-500">
                          {eligibilityReasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
