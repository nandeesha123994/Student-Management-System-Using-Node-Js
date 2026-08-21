const express = require("express");
const router = express.Router();
const { askChatbot } = require("../controllers/chatbotController");
const authenticate = require("../middleware/authMiddleware");

// Protected route: Logged-in students only
router.post("/ask", authenticate, askChatbot);

module.exports = router;
