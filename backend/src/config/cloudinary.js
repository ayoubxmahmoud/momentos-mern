// Import the v2 version of the Cloudinary SDK
import { v2 as cloudinary } from "cloudinary";
// Import dotenv to load environment variables from a .env file
import dotenv from "dotenv";

// Initialize dotenv so process.env variables become available
dotenv.config();

// Configure Cloudinary with the account credentials stored in environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper function to upload a file buffer (e.g., from Multer memoryStorage) directly to Cloudinary.
 * @param {Buffer} fileBuffer - The raw binary data of the image file.
 * @param {string} folder - The target folder name in Cloudinary (defaults to "momentos").
 * @returns {Promise<{url: string, publicId: string}>} - Resolves with the image's secure URL and public ID.
 */
export const uploadToCloudinary = (fileBuffer, folder = "momentos") => {
    // Wrap the stream-based upload in a Promise so it can be used with async/await
    return new Promise((resolve, reject) => {
        // Create an upload stream targeting the specified folder and restricting uploads to images
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image" },
            (error, result) => {
                // Reject the promise if Cloudinary returns an error during upload
                if (error) return reject(error);

                // Resolve the promise with the HTTPS URL and unique ID needed to manage/delete the image later
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        // Write the file buffer into the stream and close it to trigger the upload
        stream.end(fileBuffer);
    });
};

// Export the configured cloudinary instance as default for other operations (like deleting images)
export default cloudinary;
