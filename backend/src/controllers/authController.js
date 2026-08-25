const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const { sendLoginEmail } = require("../config/mailer");

// Register Admin/User
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
      where: {
        email: normalizedEmail,
      },
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

    res.status(201).json({
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

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Login User or Student
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check User and Student at the same time for faster login
    const [user, student] = await Promise.all([
      prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      }),
      prisma.student.findUnique({
        where: {
          email: normalizedEmail,
        },
      }),
    ]);

    // =========================
    // CHECK USER / ADMIN LOGIN
    // =========================
    if (user && user.password) {
      const isUserPasswordValid = await bcrypt.compare(password, user.password);

      if (isUserPasswordValid) {
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          },
        );

        // Send login email in background.
        // We DON'T await it, so login remains fast.
        sendLoginEmail({
          name: user.name,
          email: user.email,
          role: user.role,
        }).catch((error) => {
          console.error("Login email background error:", error.message);
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

    // =========================
    // CHECK STUDENT LOGIN
    // =========================
    if (student) {
      if (student.status === "INACTIVE") {
        return res.status(403).json({
          message:
            "Your account is inactive. Please contact the administrator.",
        });
      }

      if (student.password) {
        const isStudentPasswordValid = await bcrypt.compare(
          password,
          student.password,
        );

        if (isStudentPasswordValid) {
          const token = jwt.sign(
            {
              id: student.id,
              email: student.email,
              role: "STUDENT",
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "1d",
            },
          );

          // Send login email in background.
          // Login will not wait for the email.
          sendLoginEmail({
            name: student.name,
            email: student.email,
            role: "STUDENT",
          }).catch((error) => {
            console.error("Login email background error:", error.message);
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

    // Admin-added student without password
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

// Forgot Password - Check Email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      return res.status(200).json({
        message: "Email found. You can reset your password.",
        userType: "USER",
        email: user.email,
      });
    }

    const student = await prisma.student.findUnique({
      where: { email: normalizedEmail },
    });

    if (student) {
      return res.status(200).json({
        message: "Email found. You can reset your password.",
        userType: "STUDENT",
        email: student.email,
      });
    }

    return res.status(404).json({
      message: "No account found with this email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, userType, newPassword } = req.body;

    if (!email || !userType || !newPassword) {
      return res.status(400).json({
        message: "Email, user type and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (userType === "USER") {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      await prisma.user.update({
        where: {
          email: normalizedEmail,
        },
        data: {
          password: hashedPassword,
        },
      });

      return res.status(200).json({
        message:
          "Password reset successfully. Please login with your new password.",
      });
    }

    if (userType === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { email: normalizedEmail },
      });

      if (!student) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      await prisma.student.update({
        where: {
          email: normalizedEmail,
        },
        data: {
          password: hashedPassword,
        },
      });

      return res.status(200).json({
        message:
          "Password reset successfully. Please login with your new password.",
      });
    }

    return res.status(400).json({
      message: "Invalid user type",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
  