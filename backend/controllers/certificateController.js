const path = require('path');
const fs = require('fs');

exports.issue = async (req, res) => {
  // Path to the dummy certificate relative to the current file (certificateController.js)
  // __dirname = backend/controllers
  // ../ = backend
  // ../../ = project root (e-learning_unesa)
  const dummyCertificatePath = path.join(__dirname, '..', '..', 'dokumen', 'sertif.pdf');

  if (fs.existsSync(dummyCertificatePath)) {
    // Set a user-friendly name for the downloaded file
    res.download(dummyCertificatePath, 'sertifikat_kompetensi.pdf', (err) => {
      if (err) {
        console.error("Error downloading the dummy certificate:", err);
        // Important to send a response to the client if an error occurs during download
        if (!res.headersSent) {
          res.status(500).json({
            status: 'error',
            message: 'Could not download the certificate.',
            error: err.message
          });
        }
      }
    });
  } else {
    console.error("Dummy certificate file not found at:", dummyCertificatePath);
    res.status(404).json({
      status: 'error',
      message: 'Certificate file not found.'
    });
  }
};
