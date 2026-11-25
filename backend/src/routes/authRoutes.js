import express from "express";
import { getUserProfile, loginUser, registerUser, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js"
import { addComment, deleteComment } from "../controllers/momentoController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.get("/profile/:id", getUserProfile);
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);
export default router;