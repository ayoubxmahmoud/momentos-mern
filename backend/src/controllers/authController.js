import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import cloudinary, { uploadToCloudinary } from "../config/cloudinary.js";

// Helper to sign a 7-day JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// Controller to handle new user registration
export const registerUser = async (req, res) => {
  try {
    // Extract user details from the incoming request body
    const { name, email, password } = req.body;

    // Validate that all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Enforce minimum password length before hashing
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if a user with this email already exists in the database
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Generate a salt and hash the plain-text password for secure storage
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user document in MongoDB
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword, // Store the hashed password, never the plain-text one
    });

    // Generate a JWT token using the new user's unique database ID
    const token = generateToken(user._id);

    // Send back a 201 (Created) status with safe user data (excluding password) and the token
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    // Log unexpected errors for debugging and return a generic 500 server error
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};


// @desc    Login existing user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};
// @desc Get public profile of any user by ID
// @route GET /api/auth/profile/:id
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if(!user) {
      return res.status(404).json({ message: "User not found"});
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile: ", error);
    res.status(500).json({ message: "Failed to fetch user profile"});
  }
}
// @desc    Update user name and/or avatar
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.name?.trim()) {
      user.name = req.body.name.trim();
    }

    if (req.file) {
      // Remove previous avatar from Cloudinary if one existed
      if (user.avatar?.publicId) {
        await cloudinary.uploader.destroy(user.avatar.publicId);
      }
      user.avatar = await uploadToCloudinary(req.file.buffer, "momentos_avatars");
    }

    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
