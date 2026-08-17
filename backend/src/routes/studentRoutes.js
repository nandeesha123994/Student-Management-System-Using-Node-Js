const express = require("express");
const validateStudent = require("../validations/studentValidation");

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// USER + ADMIN
router.get("/", authMiddleware, getAllStudents);
router.get("/:id", authMiddleware, getStudentById);

// ADMIN only
router.post("/", authMiddleware, adminMiddleware, validateStudent, createStudent);
router.put("/:id", authMiddleware, adminMiddleware, validateStudent, updateStudent);
router.delete("/:id", authMiddleware, adminMiddleware, deleteStudent);

module.exports = router;