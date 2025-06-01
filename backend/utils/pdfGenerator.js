const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path'); // For ensuring directory exists and creating full paths

module.exports = (name, courseTitle)=>{
  const recipientName = name || 'CertificateRecipient'; // Default if name is undefined
  const actualCourseTitle = courseTitle || 'Untitled Course'; // Default if courseTitle is undefined

  // Ensure the certificates directory exists
  const certificatesDir = path.join(__dirname, '..', 'certificates');
  if (!fs.existsSync(certificatesDir)){
    fs.mkdirSync(certificatesDir, { recursive: true });
  }

  // Sanitize recipientName for use in filename (e.g., replace spaces with underscores)
  const sanitizedName = recipientName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
  const filename = `${sanitizedName}-${Date.now()}.pdf`;
  const filePath = path.join(certificatesDir, filename);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(30).text('SERTIFIKAT', { align:'center' });
  doc.moveDown().fontSize(18).text(`Diberikan kepada ${recipientName}`,{align:'center'}); // Use recipientName
  doc.moveDown().text(`Course: ${actualCourseTitle}`,{align:'center'}); // Use actualCourseTitle
  doc.end();
  return filePath; // Return the full, absolute path to the generated file
};
