const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Student Management System Backend is Running");
});

module.exports = app;