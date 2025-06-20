import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function CertificatePage() {
  const { courseId } = useParams();
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [waGroupLink, setWaGroupLink] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchCertificate() {
      try {
        const response = await api.get(`/courses/${courseId}/certificate`);
        if (response.data.certificateUrl && response.data.isApproved) {
          setCertificateUrl(response.data.certificateUrl);
          setIsApproved(true);
          // Fetch WhatsApp group link
          const waResp = await api.get(`/courses/${courseId}/wa-group`);
          setWaGroupLink(waResp.data.waGroupLink);
        } else {
          setIsApproved(false);
        }
      } catch (error) {
        console.error('Error fetching certificate:', error);
      }
    }
    fetchCertificate();
  }, [courseId]);

  const handleReviewSubmit = async () => {
    if (!reviewText) {
      alert('Please enter your review.');
      return;
    }
    try {
      await api.post(`/courses/${courseId}/reviews`, {
        reviewText,
        rating,
      });
      setMessage('Review submitted successfully.');
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage('Failed to submit review.');
    }
  };

  return (
    <div>
      <h1>Certificate</h1>
      {isApproved ? (
        <div>
          <iframe
            src={certificateUrl}
            title="Certificate"
            width="600"
            height="400"
          />
          <h2>Submit Your Review</h2>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            cols={50}
            placeholder="Write your review here..."
          />
          <br />
          <label>
            Rating:
            <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
              <option value={0}>Select rating</option>
              <option value={1}>1 Star</option>
              <option value={2}>2 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={5}>5 Stars</option>
            </select>
          </label>
          <br />
          <button onClick={handleReviewSubmit}>Submit Review</button>
          <p>{message}</p>
          {waGroupLink && (
            <div>
              <h3>Join the WhatsApp Group Discussion</h3>
              <a href={waGroupLink} target="_blank" rel="noopener noreferrer">
                Click here to join the WhatsApp group
              </a>
            </div>
          )}
        </div>
      ) : (
        <p>Your certificate is not approved yet. Please wait for admin approval.</p>
      )}
    </div>
  );
}

export default CertificatePage;
