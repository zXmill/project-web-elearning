const { Enrollment, Review, Course, User } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const practicalTestAreas = ['Paha', 'Betis', 'Pinggang punggung', 'Lengan'];

// Assign a random practical test to an enrollment after post-test
async function assignPracticalTest(req, res) {
  try {
    const enrollmentId = req.params.id;
    const enrollment = await Enrollment.findByPk(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    if (enrollment.assignedPracticalTest) {
      return res.status(400).json({ message: 'Practical test already assigned' });
    }
    const randomIndex = Math.floor(Math.random() * practicalTestAreas.length);
    enrollment.assignedPracticalTest = practicalTestAreas[randomIndex];
    enrollment.practicalTestStatus = 'Belum Dikumpulkan';
    await enrollment.save();
    return res.json({ assignedPracticalTest: enrollment.assignedPracticalTest });
  } catch (error) {
    console.error('Error assigning practical test:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Submit practical test file URL and update status
async function submitPracticalTest(req, res) {
  try {
    const enrollmentId = req.params.id;
    const { practicalTestFileUrl } = req.body;
    const enrollment = await Enrollment.findByPk(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    enrollment.practicalTestFileUrl = practicalTestFileUrl;
    enrollment.practicalTestStatus = 'Sudah Dikumpulkan';
    await enrollment.save();
    return res.json({ message: 'Practical test submitted successfully' });
  } catch (error) {
    console.error('Error submitting practical test:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Admin download recordings (pre-test, post-test, practical test)
async function downloadRecordings(req, res) {
  try {
    const enrollmentId = req.params.id;
    const enrollment = await Enrollment.findByPk(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    // Assuming recordings URLs are stored in enrollment or related models
    // For demo, we return URLs in JSON
    const recordings = {
      preTestRecordingUrl: enrollment.preTestRecordingUrl || null,
      postTestRecordingUrl: enrollment.postTestRecordingUrl || null,
      practicalTestFileUrl: enrollment.practicalTestFileUrl || null,
    };
    return res.json({ recordings });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Submit a review for a course
async function submitReview(req, res) {
  try {
    const courseId = req.params.id;
    const userId = req.user.id; // Assuming user is authenticated and user id is in req.user
    const { reviewText, rating } = req.body;

    if (!reviewText) {
      return res.status(400).json({ message: 'Review text is required' });
    }

    const existingReview = await Review.findOne({
      where: { courseId, userId }
    });

    if (existingReview) {
      // Update existing review
      existingReview.reviewText = reviewText;
      existingReview.rating = rating;
      await existingReview.save();
      return res.json({ message: 'Review updated successfully' });
    } else {
      // Create new review
      await Review.create({ courseId, userId, reviewText, rating });
      return res.json({ message: 'Review submitted successfully' });
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get WhatsApp group link for a course if user is approved
async function getWaGroupLink(req, res) {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({
      where: {
        courseId,
        userId,
        certificateAdminApprovedAt: { [Op.ne]: null }
      }
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Access denied. Certificate not approved yet.' });
    }

    const course = await Course.findByPk(courseId);
    if (!course || !course.waGroupLink) {
      return res.status(404).json({ message: 'WhatsApp group link not found' });
    }

    return res.json({ waGroupLink: course.waGroupLink });
  } catch (error) {
    console.error('Error fetching WhatsApp group link:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  assignPracticalTest,
  submitPracticalTest,
  downloadRecordings,
  submitReview,
  getWaGroupLink,
};
