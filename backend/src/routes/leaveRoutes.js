const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  getPendingLeaveCount,
} = require("../controllers/leaveController");

const authenticate = require("../middleware/authMiddleware");

// ==========================================
// STUDENT ROUTES
// ==========================================

// Apply for leave
router.post("/", authenticate, applyLeave);

// Get logged-in student's leave requests
router.get("/my-leaves", authenticate, getMyLeaves);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get pending leave count
router.get("/pending/count", authenticate, getPendingLeaveCount);

// Get all leave requests
router.get("/", authenticate, getAllLeaves);

// Approve or reject leave
router.put("/:id", authenticate, updateLeaveStatus);

module.exports = router;
