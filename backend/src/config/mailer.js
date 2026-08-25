const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
});

transporter
  .verify()
  .then(() => {
    console.log("✅ Email server is ready");
  })
  .catch((error) => {
    console.error("❌ Email configuration error:", error.message);
    console.error("Email error code:", error.code);
  });

module.exports = transporter;
