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

// CORS configuration for production - allow frontend origin
const allowedOrigins = [
  "https://student-management-system-using-nod-five.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // allow all for now during development
      }
    },
    credentials: true,
  })
);
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

//For Doubts
app.use("/api/doubts", doubtRoutes);

// Chatbot (Student AI Assistant)
app.use("/api/chatbot", chatbotRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("Student Management System Backend is Running");
});

// Error Middleware
app.use(errorMiddleware);

module.exports = app;
