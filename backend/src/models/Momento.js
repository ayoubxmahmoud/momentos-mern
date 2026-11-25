import mongoose from "mongoose";

// 1: Create a schema
// 2: Create a model based on that schema
const commentSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: [true, "Comment text is required"],
            trim: true,
            maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const momentoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [100, "Title cannot exeed 100 characters"]
        },
        content: {
            type: String,
            required: [true, "Content is required"],
            trim: true,
        },
        // Image storage(stores Cloudinary URL + public_id for easy deletion later)
        image: {
            url: {
                type: String,
                default: ""
            },
            publicId: {
                type: String,
                default: ""
            }
        },
        // Array of keywords for filtering and search
        tags: {
            type: [String],
            default: []
        },
        // Array of user IDs who likes this Momento (Prevents duplicate likes)
        likes: {
            type: [String],
            default: []
        },
        comments: {
            type: [commentSchema],
            default: [],
        },
        // Reference to the User who created this entry
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },
    },
    { timestamps: true }// createdAt, updatedAt
);
const Momento = mongoose.model("Momento", momentoSchema);

export default Momento;