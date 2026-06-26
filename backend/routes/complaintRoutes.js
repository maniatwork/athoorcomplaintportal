import express from "express";
import {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getComplaintStatus,
  updateComplaintStatus,
  downloadComplaintPdf,
  deleteComplaint
} from "../controllers/complaintController.js";
import authMiddleware from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.post("/", upload.single("pdf"), createComplaint);
router.get("/status/:complaintId", getComplaintStatus);

// Protected routes (admin only)
router.get("/", authMiddleware, getAllComplaints);
router.get("/:id", authMiddleware, getComplaintById);
router.get("/:id/download", authMiddleware, downloadComplaintPdf);
router.patch("/:id/status", authMiddleware, updateComplaintStatus);
router.delete("/:id", authMiddleware, deleteComplaint);

export default router;
