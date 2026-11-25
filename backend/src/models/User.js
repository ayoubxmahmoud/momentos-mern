import mongoose from "mongoose";

// Define the structure and validation rules for User documents in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"], // Makes the field mandatory with a custom error message
      trim: true,                           // Removes extra spaces from the start and end
      maxlength: [50, "Name cannot exceed 50 characters"], // Caps name length at 50 chars
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,    // Prevents duplicate accounts with the same email address
      lowercase: true, // Automatically converts email to lowercase before saving
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"], // Enforces minimum length (before hashing)
    },
    avatar: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

  },
  {
    timestamps: true, // Automatically adds and updates 'createdAt' and 'updatedAt' fields
  }
);
const User = mongoose.model("User", userSchema);

export default User;