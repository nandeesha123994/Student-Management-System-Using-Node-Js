const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { sendLoginEmail, sendResetPasswordEmail } = require("../config/mailer");

// ==========================================
// REGISTER ADMIN / USER
// ==========================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// LOGIN USER / STUDENT
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [user, student] = await Promise.all([
      prisma.user.findUnique({
        where: { email: normalizedEmail },
      }),
      prisma.student.findUnique({
        where: { email: normalizedEmail },
      }),
    ]);

    // USER / ADMIN LOGIN
    if (user && user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1d" },
        );

        sendLoginEmail({
          name: user.name,
          email: user.email,
        }).catch((error) => {
          console.error("Login email error:", error.message);
        });

        return res.status(200).json({
          message: "Login successful",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    }

    // STUDENT LOGIN
    if (student) {
      if (student.status === "INACTIVE") {
        return res.status(403).json({
          message:
            "Your account is inactive. Please contact the administrator.",
        });
      }

      if (student.password) {
        const isPasswordValid = await bcrypt.compare(
          password,
          student.password,
        );

        if (isPasswordValid) {
          const token = jwt.sign(
            {
              id: student.id,
              email: student.email,
              role: "STUDENT",
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" },
          );

          sendLoginEmail({
            name: student.name,
            email: student.email,
          }).catch((error) => {
            console.error("Login email error:", error.message);
          });

          return res.status(200).json({
            message: "Student login successful",
            token,
            user: {
              id: student.id,
              name: student.name,
              email: student.email,
              role: "STUDENT",
            },
          });
        }
      }
    }

    if (student && !student.password) {
      return res.status(401).json({
        message: "Password is not set for this student. Please register first.",
      });
    }

    return res.status(401).json({
      message: "Invalid email or password",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// FORGOT PASSWORD - GENERATE & SAVE TOKEN
// ==========================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find account in User or Student table
    const [user, student] = await Promise.all([
      prisma.user.findUnique({
        where: { email: normalizedEmail },
      }),
      prisma.student.findUnique({
        where: { email: normalizedEmail },
      }),
    ]);

    console.log("User found:", !!user);
    console.log("Student found:", !!student);

    const account = user || student;

    if (!account) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log("NEW TOKEN GENERATED:", resetToken);

    // Token expires after 15 minutes
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    console.log("GENERATED TOKEN:", resetToken);

    // Save token in the correct table
    let updatedAccount;

    if (user) {
      updatedAccount = await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      console.log("TOKEN SAVED FOR USER");
    } else {
      updatedAccount = await prisma.student.update({
        where: { id: student.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      console.log("TOKEN SAVED FOR STUDENT");
    }

    // Confirm exactly what was returned after saving
    console.log("SAVED TOKEN:", updatedAccount.resetToken);
    console.log("TOKEN EXPIRY:", updatedAccount.resetTokenExpiry);

    // Create frontend reset URL
    const resetLink = `https://student-management-system-using-nod-five.vercel.app/reset-password?token=${resetToken}`;

    console.log("RESET LINK:", resetLink);

    // Send reset email
    await sendResetPasswordEmail({
      name: account.name,
      email: account.email,
      resetLink,
    });

    console.log("✅ Reset email sent successfully");

    return res.status(200).json({
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      message: "Failed to send password reset email",
    });
  }
};

// ==========================================
// RESET PASSWORD USING TOKEN
// ==========================================
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log("=================================");
    console.log("Reset password request received");
    console.log("RECEIVED TOKEN:", token);

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // First find token without checking expiry
    // This helps us identify whether the problem is token or expiry
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
      },
    });

    const student = await prisma.student.findFirst({
      where: {
        resetToken: token,
      },
    });

    console.log("User token found:", !!user);
    console.log("Student token found:", !!student);

    const account = user || student;

    // Token doesn't exist
    if (!account) {
      return res.status(400).json({
        message: "This password reset link is invalid.",
      });
    }

    console.log("DATABASE TOKEN:", account.resetToken);
    console.log("DATABASE EXPIRY:", account.resetTokenExpiry);
    console.log("CURRENT TIME:", new Date());

    // Check expiry separately
    if (
      !account.resetTokenExpiry ||
      new Date(account.resetTokenExpiry) < new Date()
    ) {
      return res.status(400).json({
        message:
          "This password reset link has expired. Please request a new one.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update USER password
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      console.log("✅ User password reset successfully");
    }

    // Update STUDENT password
    if (student) {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      console.log("✅ Student password reset successfully");
    }

    return res.status(200).json({
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      message: "Server error while resetting password",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
