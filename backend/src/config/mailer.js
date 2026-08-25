const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Welcome email after registration
const sendWelcomeEmail = async ({ name, email }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured");
      return;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Welcome to Student Management System 🎓",
      html: `
        <h2>Welcome, ${name}! 🎉</h2>
        <p>Your Student Management System account has been created successfully.</p>
        <p>You can now log in and access your student portal.</p>
        <br />
        <p>Thank you!</p>
      `,
    });

    if (error) {
      console.error("❌ Welcome email sending failed:", error);
      return;
    }

    console.log("✅ Welcome email sent successfully:", data);
  } catch (error) {
    console.error("❌ Welcome email sending failed:", error.message);
  }
};

// Login notification email
const sendLoginEmail = async ({ name, email }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured");
      return;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "New Login to Your Student Management Account 🔐",
      html: `
        <h2>Hello, ${name}! 👋</h2>
        <p>You have successfully logged in to the Student Management System.</p>
        <p>If this was you, no action is needed.</p>
        <br />
        <p>Thank you!</p>
        <p><strong>Student Management System</strong></p>
      `,
    });

    if (error) {
      console.error("❌ Login email sending failed:", error);
      return;
    }

    console.log("✅ Login notification email sent successfully:", data);
  } catch (error) {
    console.error("❌ Login email sending failed:", error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendLoginEmail,
};
