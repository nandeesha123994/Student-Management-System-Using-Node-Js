const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  markAttendance,
  getStudentsByCourse,
  getAttendanceByDate,
  getMyAttendance,
} = require("../controllers/attendanceController");

// ==========================================
// ADMIN: MARK ATTENDANCE
// ==========================================
router.post("/", authMiddleware, adminMiddleware, markAttendance);

// ==========================================
// ADMIN: GET STUDENTS BY COURSE
// Example: /api/attendance/students/course/1
// ==========================================
router.get(
  "/students/course/:courseId",
  authMiddleware,
  adminMiddleware,
  getStudentsByCourse,
);

// ==========================================
// ADMIN: GET ATTENDANCE BY COURSE AND DATE
// Example:
// /api/attendance?courseId=1&date=2026-08-19
// ==========================================
router.get("/", authMiddleware, adminMiddleware, getAttendanceByDate);

// ==========================================
// STUDENT: GET OWN ATTENDANCE
// ==========================================
router.get("/my-attendance", authMiddleware, getMyAttendance);

module.exports = router;
