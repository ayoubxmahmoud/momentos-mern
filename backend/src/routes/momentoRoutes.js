// Momentos API Routes (router): Maps HTTP endpoints (GET, POST, PATCH, DELETE)
// to controller functions for fetching, creating (with multer image uploads),
// liking, and deleting posts.

import express from "express";
import upload from "../middleware/upload.js";
import { protect } from '../middleware/authMiddleware.js';
import {
  getMomentos,
  createMomento,
  likeMomento,
  updateMomento,
  addComment,
  deleteComment
} from "../controllers/momentoController.js";


const router = express.Router();
// Protect POST, PATCH, and DELETE, Keep GET / public so guest users can browse the Home page
router.get("/", getMomentos);
router.post("/", protect, upload.single("image"), createMomento);
router.patch("/:id/like", protect, likeMomento);
router.put("/:id", protect,upload.single("image"), updateMomento);
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

export default router;
