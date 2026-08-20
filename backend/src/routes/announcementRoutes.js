const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

// ==========================================
// ADMIN: CREATE ANNOUNCEMENT
// ==========================================
router.post("/", authMiddleware, adminMiddleware, createAnnouncement);

// ==========================================
// ALL LOGGED-IN USERS: GET ANNOUNCEMENTS
// Admin and Student can view
// ==========================================
router.get("/", authMiddleware, getAllAnnouncements);

// ==========================================
// ADMIN: UPDATE ANNOUNCEMENT
// ==========================================
router.put("/:id", authMiddleware, adminMiddleware, updateAnnouncement);

// ==========================================
// ADMIN: DELETE ANNOUNCEMENT
// ==========================================
router.delete("/:id", authMiddleware, adminMiddleware, deleteAnnouncement);

module.exports = router;
