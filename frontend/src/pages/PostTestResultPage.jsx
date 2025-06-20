import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function PostTestResultPage() {
  const { identifier } = useParams(); // Correctly use 'identifier' from the route
  const [postTestScore, setPostTestScore] = useState(null);
  const [assignedPracticalTest, setAssignedPracticalTest] = useState(null);
  const [enrollmentId, setEnrollmentId] = useState(null); // State to hold the enrollment ID
  const [practicalTestFile, setPracticalTestFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch post test score and assigned practical test
    async function fetchData() {
      if (!identifier) return; // Do not fetch if identifier is not available
      try {
        const response = await api.get(`/courses/${identifier}/posttest-result`);
        setPostTestScore(response.data.score);
        setEnrollmentId(response.data.enrollmentId); // Store the enrollment ID

        if (response.data.assignedPracticalTest) {
          setAssignedPracticalTest(response.data.assignedPracticalTest);
        } else {
          // Assign practical test if not assigned yet
          const assignResp = await api.post(`/enrollments/${response.data.enrollmentId}/assign-practical-test`);
          setAssignedPracticalTest(assignResp.data.assignedPracticalTest);
        }
      } catch (error) {
        console.error('Error fetching post test result:', error);
      }
    }
    fetchData();
  }, [identifier]); // Depend on identifier

  const handleFileChange = (e) => {
    setPracticalTestFile(e.target.files[0]);
  };

  const handleSubmitPracticalTest = async () => {
    if (!practicalTestFile) {
      alert('Please select a file to upload.');
      return;
    }
    if (!enrollmentId) {
      alert('Cannot submit, enrollment information is missing.');
      return;
    }
    setUploadStatus('Uploading...');
    try {
      // Upload file to server or S3 and get URL
      // For demo, we assume file URL is obtained after upload
      // TODO: Implement actual file upload to backend or S3
      const fileUrl = URL.createObjectURL(practicalTestFile);

      await api.post(`/enrollments/${enrollmentId}/submit-practical-test`, { // Use the correct enrollmentId
        practicalTestFileUrl: fileUrl,
      });
      setUploadStatus('Upload successful!');
      // Optionally refresh or navigate
    } catch (error) {
      console.error('Error submitting practical test:', error);
      setUploadStatus('Upload failed.');
    }
  };

  return (
    <div>
      <h1>Post Test Result</h1>
      {postTestScore !== null && <p>Your post test score: {postTestScore}</p>}

      {assignedPracticalTest ? (
        <div>
          <h2>Practical Test Assignment</h2>
          <p>You have been assigned the practical test area: <strong>{assignedPracticalTest}</strong></p>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleSubmitPracticalTest}>Submit Practical Test</button>
          <p>{uploadStatus}</p>
        </div>
      ) : (
        <p>Assigning your practical test...</p>
      )}
    </div>
  );
}

export default PostTestResultPage;
