const prisma = require("../config/prisma");

// Create Student
const createStudent = async (req, res) => {
  try {
    const { name, email, phone, gender, address, courseId } = req.body;

    if (!name || !email || !phone || !gender || !courseId) {
      return res.status(400).json({
        message: "Name, email, phone, gender and course are required"
      });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { email }
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student already exists"
      });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: Number(courseId)
      }
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    const student = await prisma.student.create({
      data: {
        name,
        email,
        phone,
        gender,
        address,
        courseId: Number(courseId)
      },
      include: {
        course: true
      }
    });

    res.status(201).json({
      message: "Student created successfully",
      student
    });
  } catch (error) {
    console.error("Create Student Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Get All Students + Search + Filter + Pagination
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
              mode: "insensitive"
            }
          },
          {
            email: {
              contains: search,
              mode: "insensitive"
            }
          }
        ]
      }),

      ...(courseId && {
        courseId: Number(courseId)
      })
    };

    const totalStudents = await prisma.student.count({
      where
    });

    const students = await prisma.student.findMany({
      where,
      include: {
        course: true
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    });

    res.status(200).json({
      message: "Students fetched successfully",
      totalStudents,
      currentPage: page,
      totalPages: Math.ceil(totalStudents / limit),
      students
    });

  } catch (error) {
    console.error("Get Students Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Get Student By ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        course: true
      }
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json({
      message: "Student fetched successfully",
      student
    });

  } catch (error) {
    console.error("Get Student Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Update Student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, gender, address, status, courseId } = req.body;

    const existingStudent = await prisma.student.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!existingStudent) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: {
          id: Number(courseId)
        }
      });

      if (!course) {
        return res.status(404).json({
          message: "Course not found"
        });
      }
    }

    const student = await prisma.student.update({
      where: {
        id: Number(id)
      },
      data: {
        name,
        email,
        phone,
        gender,
        address,
        status,
        ...(courseId && {
          courseId: Number(courseId)
        })
      },
      include: {
        course: true
      }
    });

    res.status(200).json({
      message: "Student updated successfully",
      student
    });

  } catch (error) {
    console.error("Update Student Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Delete Student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const existingStudent = await prisma.student.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!existingStudent) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    await prisma.student.delete({
      where: {
        id: Number(id)
      }
    });

    res.status(200).json({
      message: "Student deleted successfully"
    });

  } catch (error) {
    console.error("Delete Student Error:", error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};