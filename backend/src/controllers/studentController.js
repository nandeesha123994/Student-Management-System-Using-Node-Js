const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const transporter = require("../config/mailer");

// Create Student - ADMIN
const createStudent = async (req, res) => {
  try {
    const { name, email, phone, gender, address, courseId } = req.body;

    if (!name || !email || !phone || !gender || !courseId) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { email },
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student already exists",
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Only active courses can be selected for a student",
      });
    }

    const student = await prisma.student.create({
      data: {
        name,
        email,
        phone,
        gender,
        address,
        courseId: Number(courseId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        address: true,
        status: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
        course: true,
      },
    });

    res.status(201).json({
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    console.error("Create Student Error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Students
const getAllStudents = async (req, res) => {
  try {
    const { search, courseId } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),

      ...(courseId && {
        courseId: Number(courseId),
      }),
    };

    const totalStudents = await prisma.student.count({
      where,
    });

    const students = await prisma.student.findMany({
      where,
      include: {
        course: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    res.status(200).json({
      message: "Students fetched successfully",
      totalStudents,
      currentPage: page,
      totalPages: Math.ceil(totalStudents / limit),
      students,
    });
  } catch (error) {
    console.error("Get Students Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Student By ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        course: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student fetched successfully",
      student,
    });
  } catch (error) {
    console.error("Get Student Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, email, phone, gender, address, status, courseId } = req.body;

    const existingStudent = await prisma.student.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Check course if course is being changed
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: {
          id: Number(courseId),
        },
      });

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      if (course.status !== "ACTIVE") {
        return res.status(400).json({
          message: "Only active courses can be selected for a student",
        });
      }
    }

    const student = await prisma.student.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        email,
        phone,
        gender,
        address,
        status,

        ...(courseId && {
          courseId: Number(courseId),
        }),
      },
      include: {
        course: true,
      },
    });

    res.status(200).json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update Student Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const existingStudent = await prisma.student.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    await prisma.student.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete Student Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Logged-in Student Profile
const getStudentProfile = async (req, res) => {
  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        message: "Access denied. Student only.",
      });
    }

    const student = await prisma.student.findUnique({
      where: {
        id: Number(req.user.id),
      },
      include: {
        course: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      message: "Student profile fetched successfully",
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        gender: student.gender,
        address: student.address,
        status: student.status,
        course: student.course,
      },
    });
  } catch (error) {
    console.error("Get Student Profile Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Student Self Registration + Welcome Email
const registerStudent = async (req, res) => {
  try {
    console.log("Register student function is running!");

    const { name, email, password, phone, gender, address, courseId } =
      req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !gender || !courseId) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check whether email already exists
    const existingStudent = await prisma.student.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Email is already registered",
      });
    }

    // Check course
    const course = await prisma.course.findUnique({
      where: {
        id: Number(courseId),
      },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Please select an active course",
      });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student in database
    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone,
        gender,
        address: address?.trim() || "",
        courseId: Number(courseId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        address: true,
        status: true,
        courseId: true,
      },
    });

    console.log("Student created successfully:", student.email);

    // ==========================================
    // SEND WELCOME EMAIL
    // Email failure will NOT fail registration
    // ==========================================
    let emailSent = false;

    try {
      console.log("Trying to send welcome email to:", normalizedEmail);

      const mailInfo = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Welcome to Student Management System!",
        text: `Hi ${name.trim()},

Welcome to the Student Management System!

Your registration was successful. You can now log in to your account.

Thank you!`,
      });

      emailSent = true;

      console.log("Welcome email sent successfully!");
      console.log("Message ID:", mailInfo.messageId);
    } catch (emailError) {
      console.error("=================================");
      console.error("EMAIL SENDING FAILED!");
      console.error(emailError.message);
      console.error("=================================");
    }

    // Registration response is always successful
    // even if email sending fails
    res.status(201).json({
      message: emailSent
        ? "Registration successful! Welcome email sent. You can now login."
        : "Registration successful! You can now login.",
      student,
      emailSent,
    });
  } catch (error) {
    console.error("Student Registration Error:", error);

    res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
};

module.exports = {
  createStudent,
  registerStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentProfile,
};
