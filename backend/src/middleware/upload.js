/*** Configure Multer to accepts images files up to 5MB in memory***/
// Import Multer, a Node.js middleware for handling multipart/form-data (file uploads)
import multer from "multer";

// Store uploaded files in server memory (RAM) as Buffer objects instead of saving to disk.
// This is ideal when immediately streaming files to cloud storage like Cloudinary.
const storage = multer.memoryStorage();

/**
 * Filter function to validate the file type before accepting the upload.
 * @param {Object} req - The Express request object.
 * @param {Object} file - Metadata about the uploaded file (including mimetype).
 * @param {Function} cb - Callback function to accept (true) or reject (false) the file.
 */
const fileFilter = (req, file, cb) => {
  // Check if the file's MIME type starts with "image/" (e.g., image/jpeg, image/png, image/webp)
  if (file.mimetype.startsWith("image/")) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file and pass an error message
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Initialize the Multer instance with the configured storage, filter, and size limits
const upload = multer({
  storage,
  fileFilter,
  // Restrict the maximum file size to 5 megabytes (5 * 1024 * 1024 bytes) to prevent server overload
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Export the configured middleware to be used in Express routes (e.g., upload.single("image"))
export default upload;
