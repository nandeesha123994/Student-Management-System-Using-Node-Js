const express = require("express");

const validateStudent = require("../validations/studentValidation");

const {
  createStudent,
  registerStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentProfile,
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Student Public Registration
router.post("/register", registerStudent);

// Student Profile
router.get("/me", authMiddleware, getStudentProfile);

// USER + ADMIN
router.get("/", authMiddleware, getAllStudents);
router.get("/:id", authMiddleware, getStudentById);

// ADMIN only
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validateStudent,
  createStudent,
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateStudent,
  updateStudent,
);

router.delete("/:id", authMiddleware, adminMiddleware, deleteStudent);

module.exports = router;
