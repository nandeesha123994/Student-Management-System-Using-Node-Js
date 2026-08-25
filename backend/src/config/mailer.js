const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendWelcomeEmail = async (name, email) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured");
      return;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: [email],
      subject: "Welcome to Student Management System!",
      html: `
        <h2>Welcome, ${name}! 🎓</h2>
        <p>Your registration was successful.</p>
        <p>You can now log in to your Student Management System account.</p>
        <br />
        <p>Thank you!</p>
      `,
    });

    if (error) {
      console.error("❌ Resend email sending failed:", error);
      return;
    }

    console.log("✅ Welcome email sent successfully:", data);
  } catch (error) {
    console.error("❌ Resend email sending failed:", error.message);
  }
};

module.exports = { sendWelcomeEmail };
