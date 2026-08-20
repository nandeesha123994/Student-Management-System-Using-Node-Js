const express = require("express");

const validateCourse = require("../validations/courseValidation");

const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// PUBLIC - Needed for student registration
router.get("/", getAllCourses);

// USER + ADMIN
router.get("/:id", authMiddleware, getCourseById);

// ADMIN only + Validation
router.post("/", authMiddleware, adminMiddleware, validateCourse, createCourse);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateCourse,
  updateCourse,
);

router.delete("/:id", authMiddleware, adminMiddleware, deleteCourse);

module.exports = router;
