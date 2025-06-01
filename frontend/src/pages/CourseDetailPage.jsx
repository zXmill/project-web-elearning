import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext provides user info

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from AuthContext to check if logged in

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('deskripsi');

  // State for certificate eligibility
  const [certificateEligible, setCertificateEligible] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState('');
  const [eligibilityReasons, setEligibilityReasons] = useState([]);

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
          setError(response.data.message || 'Kursus tidak ditemukan.');
          setCourse(null);
        } else {
          setError('Gagal mengambil detail kursus atau format respons tidak sesuai.');
          setCourse(null);
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Terjadi kesalahan saat menghubungi server.');
        }
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  // Effect to check certificate eligibility
  useEffect(() => {
    const checkEligibility = async () => {
      if (courseId && user) { // Only check if user is logged in
        setEligibilityLoading(true);
        setEligibilityError('');
        setEligibilityReasons([]);
        try {
          const response = await api.get(`/courses/${courseId}/certificate/eligibility`);
          if (response.data && response.data.status === 'success') {
            setCertificateEligible(response.data.eligible);
            if (!response.data.eligible && response.data.reasons) {
              setEligibilityReasons(response.data.reasons);
            }
          } else {
            setEligibilityError(response.data.message || 'Gagal memeriksa kelayakan sertifikat.');
          }
        } catch (err) {
          console.error("Error checking certificate eligibility:", err);
          if (err.response && err.response.data && err.response.data.message) {
            setEligibilityError(err.response.data.message);
          } else {
            setEligibilityError('Terjadi kesalahan saat memeriksa kelayakan sertifikat.');
          }
        } finally {
          setEligibilityLoading(false);
          setEligibilityChecked(true);
        }
      } else {
        // If not logged in, or no courseId, don't attempt to check.
        // User will not see certificate options.
        setEligibilityChecked(false); 
      }
    };

    if (courseId && user) { // Trigger only if courseId and user are available
        checkEligibility();
    }
  }, [courseId, user]); // Rerun if courseId or user changes

  const handleDownloadCertificate = async () => {
    try {
      // The actual download is handled by the browser due to Content-Disposition
      const response = await api.get(`/courses/${courseId}/certificate/download`, {
        responseType: 'blob', // Important to handle binary data
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from content-disposition header if possible
      const contentDisposition = response.headers['content-disposition'];
      let filename = `sertifikat-${course?.judul?.replace(/\s+/g, '_') || 'kursus'}.pdf`; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch.length === 2)
          filename = filenameMatch[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Error downloading certificate:", err);
      // Display a more user-friendly error, perhaps using a toast notification library
      alert('Gagal mengunduh sertifikat. Pastikan Anda memenuhi syarat.');
      if (err.response && err.response.data) {
        // If the error response is JSON (e.g., eligibility failure from backend), try to parse it
        try {
            const errorData = JSON.parse(await err.response.data.text()); // For blob error
            if (errorData.message) {
                alert(`Detail: ${errorData.message}`);
            }
        } catch (parseError) {
            // If parsing fails, it's likely not a JSON error response
            console.error("Could not parse error response:", parseError);
        }
      }
    }
  };


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
              className="w-full bg-teraplus-accent text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-teraplus-accent focus:ring-opacity-50 mb-4"
              onClick={() => {
                // Check enrollment status before navigating
                // This logic might be more complex depending on requirements (e.g., auto-enroll or prompt)
                // For now, directly navigate or show alert.
                // A better UX would be to check enrollment and then decide.
                if (user) { // Only allow course start actions if logged in
                    if (course && course.needsPreTest) {
                        navigate(`/course/${courseId}/pretest`);
                    } else {
                        // Navigate to the first module of the course or course content page
                        navigate(`/course/${courseId}/content`); 
                    }
                } else {
                    alert("Silakan login terlebih dahulu untuk memulai kursus.");
                    navigate('/login');
                }
              }}
            >
              {course && course.needsPreTest ? 'Mulai Pre-Test' : 'Mulai Course'}
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
