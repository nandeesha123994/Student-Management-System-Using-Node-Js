const resend = require("resend");

const apiKey = process.env.RESEND_API_KEY;

const email = resend.sendMail;

module.exports = {
  sendWelcomeEmail: async ({ name, email, normalizedEmail }) => {
    if (!apiKey) {
      console.error("❌ RESEND_API_KEY not configured");
      return false;
    }

    try {
      const { data, error } = await email({
        from: `Student Management System <onboarding@resend.co>`,
        to: email,
        subject: "Welcome to Student Management System!",
        html: `
          <h2>Hi ${name}</h2>
          <p>Welcome to the Student Management System!</p>
          <p>Your registration was successful. You can now log in to your account.</p>
          <p>Thank you!</p>
        `,
      });

      if (error) {
        console.error("❌ Resend email error:", error);
        return false;
      }

      console.log("✅ Welcome email sent via Resend! Message ID:", data.id);
      return true;
    } catch (err) {
      console.error("❌ Resend email sending failed:", err.message);
      return false;
    }
  },
};