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

    // ADMIN / USER LOGIN
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

      if (!student.password) {
        return res.status(401).json({
          message:
            "Password is not set for this student. Please register first.",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, student.password);

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

    return res.status(401).json({
      message: "Invalid email or password",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// FORGOT PASSWORD
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

    const [user, student] = await Promise.all([
      prisma.user.findUnique({
        where: { email: normalizedEmail },
      }),
      prisma.student.findUnique({
        where: { email: normalizedEmail },
      }),
    ]);

    const account = user || student;

    console.log("User found:", !!user);
    console.log("Student found:", !!student);

    if (!account) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Save token in database
    let updatedAccount;

    if (user) {
      updatedAccount = await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: resetToken,
          resetTokenExpiry: resetTokenExpiry,
        },
      });
    } else {
      updatedAccount = await prisma.student.update({
        where: { id: student.id },
        data: {
          resetToken: resetToken,
          resetTokenExpiry: resetTokenExpiry,
        },
      });
    }

    // IMPORTANT: Verify saved token
    console.log("=================================");
    console.log("TOKEN GENERATED:", resetToken);
    console.log("TOKEN SAVED:", updatedAccount.resetToken);
    console.log("TOKENS MATCH:", resetToken === updatedAccount.resetToken);
    console.log("=================================");

    // Create reset link using EXACT saved token
    const resetLink = `https://student-management-system-using-nod-five.vercel.app/reset-password?token=${encodeURIComponent(updatedAccount.resetToken)}`;

    console.log("RESET LINK:", resetLink);

    await sendResetPasswordEmail({
      name: account.name,
      email: account.email,
      resetLink,
    });

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
// RESET PASSWORD
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

    // Clean token just in case
    const cleanToken = token.trim();

    // Find token in both tables
    const [user, student] = await Promise.all([
      prisma.user.findFirst({
        where: {
          resetToken: cleanToken,
        },
      }),
      prisma.student.findFirst({
        where: {
          resetToken: cleanToken,
        },
      }),
    ]);

    console.log("User token found:", !!user);
    console.log("Student token found:", !!student);

    const account = user || student;

    if (!account) {
      return res.status(400).json({
        message:
          "Invalid reset link. Please request a new password reset link.",
      });
    }

    // Check expiry
    if (
      !account.resetTokenExpiry ||
      new Date(account.resetTokenExpiry).getTime() < Date.now()
    ) {
      return res.status(400).json({
        message:
          "This password reset link has expired. Please request a new one.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update USER
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      console.log("User password reset successfully");
    }

    // Update STUDENT
    if (student) {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      console.log("Student password reset successfully");
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
