const express = require("express");

const router = express.Router();

const {
  createDoubt,
  getMyDoubts,
  getAllDoubts,
  replyToDoubt,
  getPendingDoubtsCount,
} = require("../controllers/doubtController");

// Student asks a doubt
router.post("/", createDoubt);

// Student gets their doubts
router.get("/student/:studentId", getMyDoubts);

// ADMIN: Get pending doubts count
router.get("/pending/count", getPendingDoubtsCount);

// Admin gets all doubts
router.get("/", getAllDoubts);

// Admin replies to a doubt
router.put("/:id/reply", replyToDoubt);

module.exports = router;
