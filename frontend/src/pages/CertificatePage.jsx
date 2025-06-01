import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // To get user info if needed for display

const CertificatePage = () => {
  const { courseId } = useParams();
  const { user } = useAuth(); // Get authenticated user, though backend handles eligibility logic
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eligibilityData, setEligibilityData] = useState(null);

  useEffect(() => {
    const fetchEligibilityStatus = async () => {
      if (!courseId) {
        setError('Course ID is missing.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        // This is the PROPOSED backend endpoint.
        // The backend needs to implement GET /api/courses/:courseId/certificate-eligibility
        const response = await api.get(`/courses/${courseId}/certificate-eligibility`);

        if (response.data?.status === 'success') {
          setEligibilityData(response.data.data);
        } else {
          setError(response.data?.message || 'Failed to retrieve certificate eligibility status.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while checking certificate eligibility.');
        console.error("Error fetching certificate eligibility:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibilityStatus();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teraplus-primary"></div>
        <p className="ml-4 text-lg text-gray-700">Loading certificate status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full bg-white shadow-xl rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link
            to="/courses" // Or back to the specific course page if possible
            className="px-6 py-2 bg-teraplus-primary text-white rounded-md hover:bg-teraplus-accent transition-colors"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!eligibilityData) {
    return ( // Should ideally not happen if loading is false and no error, but as a fallback
      <div className="min-h-screen bg-gray-100 px-4 py-8 flex flex-col items-center justify-center">
         <div className="max-w-2xl w-full bg-white shadow-xl rounded-lg p-8 text-center">
            <p className="text-gray-700">Could not load certificate information.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-teraplus-primary mb-6">
          Certificate Status: {eligibilityData.courseTitle || `Course ID ${courseId}`}
        </h1>

        {eligibilityData.isEligible ? (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723V18a1 1 0 10-2 0v-.008a3.066 3.066 0 00-1.745-.721 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.469 6.469a1 1 0 00-1.414-1.414L9 11.586l-1.322-1.322a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-xl text-gray-800 mb-2">
              Congratulations, {user?.namaLengkap || user?.email || 'Student'}!
            </p>
            <p className="text-gray-600 mb-6">
              You have successfully met the requirements to receive the certificate for the course: <strong>{eligibilityData.courseTitle}</strong>.
            </p>
            <a
              href={eligibilityData.certificateUrl.startsWith('http') ? eligibilityData.certificateUrl : `${api.defaults.baseURL}${eligibilityData.certificateUrl.startsWith('/') ? '' : '/'}${eligibilityData.certificateUrl}`}
              download={eligibilityData.fileName || `certificate-${courseId}.pdf`}
              target="_blank" // Good practice to open in new tab if it's a direct viewable link
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download Certificate
            </a>
          </div>
        ) : (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 100-2 1 1 0 000 2zm-1.75-5.75a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z" clipRule="evenodd" />
            </svg>
            <p className="text-xl text-gray-800 mb-2">Certificate Not Yet Available</p>
            <p className="text-gray-600 mb-1">
              For the course: <strong>{eligibilityData.courseTitle}</strong>
            </p>
            {eligibilityData.reason && (
              <p className="text-gray-600 mb-1">Reason: {eligibilityData.reason}</p>
            )}
            {typeof eligibilityData.userScore === 'number' && (
              <p className="text-gray-600 mb-1">Your Score: {eligibilityData.userScore}%</p>
            )}
            {typeof eligibilityData.requiredScore === 'number' && (
              <p className="text-gray-600 mb-4">Required Score: {eligibilityData.requiredScore}%</p>
            )}
            <Link
              to={`/courses/${courseId}`} // Link back to the course detail page
              className="mt-4 inline-block px-6 py-2 bg-teraplus-primary text-white rounded-md hover:bg-teraplus-accent transition-colors"
            >
              Go to Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatePage;
