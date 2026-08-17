const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Dashboard statistics - Protected route
router.get("/", authMiddleware, getDashboardStats);

module.exports = router;