const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const path = require("path");

// Configure AWS S3 Client
// Credentials and region should be configured in your environment (e.g., Elastic Beanstalk environment variables or IAM role)
const s3Client = new S3Client({
  region: process.env.AWS_REGION_PROD || "ap-southeast-2", // Fallback to your default region if needed
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME_PROD || "e-learning-unesa-bucket"; // UPDATED FALLBACK BUCKET NAME

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Add any file type validation you need
    // Example: Allow only images
    // if (file.mimetype.startsWith('image/')) {
    //   cb(null, true);
    // } else {
    //   cb(new Error('Not an image! Please upload an image.'), false);
    // }
    cb(null, true); // Allow all files for now, add specific filters as needed
  },
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB limit (adjust as needed)
  },
});

// Helper function to upload a file to S3
const uploadToS3 = async (file, folder = "") => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const fileName = `${folder ? folder + "/" : ""}${Date.now()}-${file.originalname.replace(/\\s+/g, '-')}`;
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: 'public-read', // Uncomment if you want files to be publicly readable by default
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    // Correctly get the region string
    const region = await s3Client.config.region();

    // Construct the S3 URL. Note: this is a common pattern but might need adjustment
    // depending on your bucket settings and if you use a custom domain or CloudFront.
    // For private files, you'd generate presigned URLs instead.
    const fileUrl = `https://${S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${fileName}`;
    return {
        url: fileUrl, // The public URL of the file in S3
        key: fileName   // The key of the file in S3 (useful for deletions)
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

module.exports = {
  upload, // Multer instance for route middleware
  uploadToS3, // Helper function to upload to S3
  s3Client, // Export S3 client if needed elsewhere (e.g., for deletions)
  S3_BUCKET_NAME
};
