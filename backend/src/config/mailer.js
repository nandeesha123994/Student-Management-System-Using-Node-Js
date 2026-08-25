const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("Email configuration error:", error.message);
    console.error("WARNING: Email transporter verification failed. Check EMAIL_USER and EMAIL_PASS environment variables.");
  } else {
    console.log("Email server is ready");
  }
});

// Also log if env vars are missing
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("WARNING: EMAIL_USER or EMAIL_PASS environment variables are not set!");
}

module.exports = transporter;
