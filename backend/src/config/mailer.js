const nodemailer = require("nodemailer");

// ==========================================
// GMAIL TRANSPORTER
// ==========================================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // false for port 587

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },

  // Prevent the server from waiting forever
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000, // 10 seconds
  socketTimeout: 15000, // 15 seconds

  tls: {
    rejectUnauthorized: false,
  },
});

// ==========================================
// WELCOME EMAIL
// ==========================================
const sendWelcomeEmail = async ({ name, email }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Student Management System 🎓" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Student Management System 🎓",
      html: `
        <h2>Welcome, ${name}! 🎉</h2>
        <p>Your Student Management System account has been created successfully.</p>
        <p>You can now log in and access your student portal.</p>
        <br />
        <p>Thank you!</p>
        <p><strong>Student Management System</strong></p>
      `,
    });

    console.log("✅ Welcome email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Welcome email sending failed:", error.message);
    throw error;
  }
};

// ==========================================
// LOGIN NOTIFICATION EMAIL
// ==========================================
const sendLoginEmail = async ({ name, email }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Student Management System 🔐" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "New Login to Your Student Management Account 🔐",
      html: `
        <h2>Hello, ${name}! 👋</h2>
        <p>You have successfully logged in to the Student Management System.</p>
        <p>If this was you, no action is needed.</p>
        <br />
        <p><strong>Student Management System</strong></p>
      `,
    });

    console.log(
      "✅ Login notification email sent successfully:",
      info.messageId,
    );

    return info;
  } catch (error) {
    console.error("❌ Login email sending failed:", error.message);

    // Login should work even if email fails
    return null;
  }
};

// ==========================================
// PASSWORD RESET EMAIL
// ==========================================
const sendResetPasswordEmail = async ({ name, email, resetLink }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Student Management System 🔐" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password 🔐",
      html: `
        <h2>Hello, ${name}! 👋</h2>
        
        <p>We received a request to reset your password.</p>

        <p>Click the button below to create a new password:</p>

        <p>
          <a 
            href="${resetLink}" 
            style="
              background: #2563eb;
              color: white;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 6px;
              display: inline-block;
            "
          >
            Reset Password
          </a>
        </p>

        <p>This link will expire in <strong>15 minutes</strong>.</p>

        <p>
          If you didn't request a password reset, you can safely ignore this email.
        </p>

        <br />

        <p><strong>Student Management System</strong></p>
      `,
    });

    console.log("✅ Password reset email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Password reset email sending failed:", error.message);
    throw error;
  }
};

// ==========================================
// EXPORT FUNCTIONS
// ==========================================
module.exports = {
  sendWelcomeEmail,
  sendLoginEmail,
  sendResetPasswordEmail,
};
