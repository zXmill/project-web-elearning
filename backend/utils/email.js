'use strict';
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  // We'll use environment variables for configuration
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports like 587
    auth: {
      user: process.env.EMAIL_USER, // Brevo SMTP login
      pass: process.env.EMAIL_PASS, // Brevo SMTP key
    },
    // WARNING: The following line bypasses SSL/TLS certificate validation.
    // This is insecure and should ONLY be used for local development if you are
    // facing 'self-signed certificate' errors and understand the risks.
    // For production, ensure your environment can validate SSL certificates properly.
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'development' ? false : true
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: process.env.EMAIL_FROM, // Sender address e.g., "Your App Name <noreply@yourapp.com>"
    to: options.to,               // List of receivers
    subject: options.subject,     // Subject line
    text: options.text,           // Plain text body
    html: options.html,           // HTML body
  };

  // 3) Actually send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('There was an error sending the email. Please try again later.');
  }
};

module.exports = sendEmail;
