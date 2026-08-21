const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const doubtRoutes = require("./routes/doubtRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ================= ROUTES =================

// Authentication
app.use("/api/auth", authRoutes);

// Students
app.use("/api/students", studentRoutes);

// Courses
app.use("/api/courses", courseRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

// Attendance
app.use("/api/attendance", attendanceRoutes);

// Announcements
app.use("/api/announcements", announcementRoutes);

// Leave Requests
app.use("/api/leave-requests", leaveRoutes);

app.use("/api/doubts", doubtRoutes);

// Chatbot (Student AI Assistant)
app.use("/api/chatbot", chatbotRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("Student Management System Backend is Running");
});

// Error Middleware - keep this LAST
app.use(errorMiddleware);

module.exports = app;
