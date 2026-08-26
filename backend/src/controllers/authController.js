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

    return res.status(500).json({
      message: "Server error",
    });
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

        // Send login email in background
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

          // Send login email in background
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

    // Student has no password
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

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// FORGOT PASSWORD - SEND RESET EMAIL
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

    // Search both User and Student tables
    const [user, student] = await Promise.all([
      prisma.user.findUnique({
        where: { email: normalizedEmail },
      }),
      prisma.student.findUnique({
        where: { email: normalizedEmail },
      }),
    ]);

    // Find which account exists
    const account = user || student;

    // Check whether the reset token was found
    console.log("User found:", !!user);
    console.log("Student found:", !!student);

    if (!account) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token expires after 15 minutes
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Save token in the correct database table
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });
    } else {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });
    }

    // Frontend URL with reset token
    const resetLink = `https://student-management-system-using-nod-five.vercel.app/reset-password?token=${resetToken}`;

    // IMPORTANT:
    // Await the email so we know whether it was actually sent.
    // Your mailer function should throw an error if sending fails.
    await sendResetPasswordEmail({
      name: account.name,
      email: account.email,
      resetLink,
    });

    return res.status(200).json({
      message:
        "Password reset link has been sent to your email. Please check your inbox.",
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

    // Find a valid User reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    // Find a valid Student reset token
    const student = await prisma.student.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    // Token was not found
    if (!user && !student) {
      return res.status(400).json({
        message:
          "This password reset link is invalid or has expired. Please request a new one.",
      });
    }

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
