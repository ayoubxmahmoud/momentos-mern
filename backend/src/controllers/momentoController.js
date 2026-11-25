import Momento from "../models/Momento.js";
import cloudinary, { uploadToCloudinary } from "../config/cloudinary.js";

/**
 * Helper to replace ObjectId references with actual User fields ("name" and "avatar").
 * Works on both Mongoose Queries (e.g., Momento.find()) and single Documents (e.g., newMomento).
 *
 * @param {Query|Document} queryOrDoc - A Mongoose query or saved document instance
 * @returns {Query|Promise<Document>} Populated query/document with safe user fields
 */
const populateMomentoFields = (queryOrDoc) => {
  return queryOrDoc.populate([
    // 1. Populate the Momento author's name and avatar (excludes sensitive fields like password/email)
    { path: "creator", select: "name avatar" },

    // 2. Populate the user object inside each nested comment in the comments array
    { path: "comments.user", select: "name avatar" },
  ]);
};

// @desc    Get all momentos (newest first)
// @route   GET /api/momentos
export const getMomentos = async (req, res) => {
  try {
    const momentos = await populateMomentoFields(Momento.find())
                      .sort({ createdAt: -1 })

    res.status(200).json(momentos);
  } catch (error) {
    console.error("Error in getMomentos:", error);
    res.status(500).json({ message: "Server error fetching momentos" });
  }
};

// @desc    Create a new momento
// @route   POST /api/momentos
export const createMomento = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Parse JSON stringified tags sent from FormData
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    }

    // Upload image to Cloudinary if a file was attached
    let imageData = { url: "", publicId: "" };
    if (req.file) {
      imageData = await uploadToCloudinary(req.file.buffer);
    }

    const newMomento = await Momento.create({
      title,
      content,
      tags: parsedTags,
      image: imageData,
      creator: req.user._id,
    });

    const populatedMomento = await populateMomentoFields(newMomento);
    res.status(201).json(populatedMomento);
  } catch (error) {
    console.error("Error in createMomento:", error);
    res.status(500).json({ message: error.message || "Failed to create momento" });
  }
};

// @desc    Toggle like on a momento
// @route   PATCH /api/momentos/:id/like
export const likeMomento = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id?.toString() || req.body.userId;

    if (!userId) {
      return res.status(401).json({ message: "User ID required to like" });
    }

    const momento = await  Momento.findById(id);
    if (!momento) {
      return res.status(404).json({ message: "Momento not found" });
    }

    const alreadyLiked = momento.likes.includes(userId);
    if (alreadyLiked) {
      momento.likes = momento.likes.filter((uid) => uid !== userId);
    } else {
      momento.likes.push(userId);
    }

    await momento.save();
    const populatedMomento = await populateMomentoFields(momento);
    res.status(200).json(populatedMomento);
  } catch (error) {
    console.error("Error in likeMomento:", error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

// @desc    Delete a momento & its Cloudinary image
// @route   DELETE /api/momentos/:id
export const deleteMomento = async (req, res) => {
  try {
    const { id } = req.params;
    const momento = await Momento.findById(id);

    if (!momento) {
      return res.status(404).json({ message: "Momento not found" });
    }
    // verify ownership
    if (momento.creator.toString !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your momentos" });
    }
    // Delete image from Cloudinary if publicId exists
    if (momento.image?.publicId) {
      await cloudinary.uploader.destroy(momento.image.publicId);
    }

    await Momento.findByIdAndDelete(id);
    res.status(200).json({ message: "Momento deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMomento:", error);
    res.status(500).json({ message: "Failed to delete momento" });
  }
};

// @desc    Update an existing momento
// @route   PUT /api/momentos/:id
export const updateMomento = async (req, res) => {
  try {
    // Extract the momento ID from the URL parameters and updated fields from the request body
    const { id } = req.params;
    const { title, content, tags } = req.body;

    // Look up the existing momento in the database by its ID
    const momento = await Momento.findById(id);
    if (!momento) {
      return res.status(404).json({ message: "Momento not found" });
    }

    // Verify ownership: ensure the logged-in user is the creator of this momento
    if (momento.creator.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only edit your own momentos" });
    }

    // Parse updated tags if provided (handles JSON strings sent via FormData)
    let parsedTags = momento.tags;
    if (tags !== undefined) {
      parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    }

    // Replace image on Cloudinary if a new file is uploaded
    let updatedImage = momento.image;
    if (req.file) {
      // Delete the old image from Cloudinary first to avoid orphaned files
      if (momento.image?.publicId) {
        await cloudinary.uploader.destroy(momento.image.publicId);
      }
      // Upload the new image buffer to Cloudinary and store its new URL/publicId
      updatedImage = await uploadToCloudinary(req.file.buffer);
    }

    // Apply updates to the document, falling back to existing values if fields were omitted
    momento.title = title?.trim() || momento.title;
    momento.content = content?.trim() || momento.content;
    momento.tags = parsedTags;
    momento.image = updatedImage;

    // Save the updated document to MongoDB
    await momento.save();

    // Populate the creator's name and avatar so the frontend gets complete display data
    const populatedMomento = await populateMomentoFields(momento);

    // Return the updated momento with a 200 (OK) status
    res.status(200).json(populatedMomento);
  } catch (error) {
    // Log any unexpected errors and send a 500 server error response
    console.error("Error in updateMomento:", error);
    res.status(500).json({ message: "Failed to update momento" });
  }
};

// @desc Add comment to a momento
// @route POST /api/momentos/:id/comments
export const addComment = async(req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required"});
    }

    const momento = await Momento.findById(id);
    if (!momento) {
      return res.status(404).json({ message: "Momento not found"});
    }
    momento.comments.push({
      text: text.trim(),
      user: req.user._id
    });
    await momento.save();
    const populatedMomento = await populateMomentoFields(momento);
    res.status(201).json(populatedMomento);
  } catch (error) {
    console.error("Error in addComment: ", error);
    res.status(500).json({ message: "Failed to add comment"});
  }
}

// @desc Delete a comment (Allowed by comment author or momento owner)
// @route DELETE /api/momentos/:id/comments/:commentId
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const momento = await Momento.findById(id);
    if (!momento) {
      return res.status(404).json({ message: "Momento not found"});
    }

    const comment = momento.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found"});
    }

    // Check for Authorization
    const userId = req.user._id.toString();
    const isCommentAuthor = comment.user.toString() === userId;
    const isMomentoOwner = momento.creator.toString() === userId;

    if (!isCommentAuthor && !isMomentoOwner) {
      return res.status(403).json("Not authorized to delete this comment");
    }
    
    comment.deleteOne();
    await momento.save();
    const populatedMomento = await populateMomentoFields(momento);
    res.status(200).json(populatedMomento);
  } catch (error) {
    console.error("Error in deleteComment: ", error);
    res.status(500).json({ message: "Failed to delete comment"});
  }
}