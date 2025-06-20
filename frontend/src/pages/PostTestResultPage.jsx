import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function PostTestResultPage() {
  const { courseId } = useParams();
  const [postTestScore, setPostTestScore] = useState(null);
  const [assignedPracticalTest, setAssignedPracticalTest] = useState(null);
  const [practicalTestFile, setPracticalTestFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch post test score and assigned practical test
    async function fetchData() {
      try {
        const response = await api.get(`/courses/${courseId}/posttest-result`);
        setPostTestScore(response.data.score);
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
  }, [courseId]);

  const handleFileChange = (e) => {
    setPracticalTestFile(e.target.files[0]);
  };

  const handleSubmitPracticalTest = async () => {
    if (!practicalTestFile) {
      alert('Please select a file to upload.');
      return;
    }
    setUploadStatus('Uploading...');
    try {
      // Upload file to server or S3 and get URL
      // For demo, we assume file URL is obtained after upload
      // TODO: Implement actual file upload to backend or S3
      const fileUrl = URL.createObjectURL(practicalTestFile);

      await api.post(`/enrollments/${courseId}/submit-practical-test`, {
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
