const prisma = require("../config/prisma");

// Create Course
const createCourse = async (req, res) => {
  try {
    const { name, description, duration, status = "ACTIVE" } = req.body;

    if (!name || !duration) {
      return res.status(400).json({
        message: "Course name and duration are required",
      });
    }

    const existingCourse = await prisma.course.findUnique({
      where: { name },
    });

    if (existingCourse) {
      return res.status(400).json({
        message: "Course already exists",
      });
    }

    const course = await prisma.course.create({
      data: {
        name,
        description,
        duration,
        status,
      },
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Courses fetched successfully",
      courses: courses.map((course) => ({
        ...course,
        studentCount: course._count?.students ?? 0,
      })),
    });
  } catch (error) {
    console.error("Get Courses Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Course By ID
const getCourseById = async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.status(200).json({
      message: "Course fetched successfully",
      course,
    });
  } catch (error) {
    console.error("Get Course Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update Course
const updateCourse = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, duration, status } = req.body;

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        name,
        description,
        duration,
        status,
      },
    });

    res.status(200).json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Update Course Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const courseId = Number(id);

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Check if students are enrolled in this course
    const students = await prisma.student.count({
      where: {
        courseId: courseId,
      },
    });

    if (students > 0) {
      return res.status(400).json({
        message:
          "Cannot delete this course because students are enrolled in it",
      });
    }

    // Delete course
    await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete Course Error:", error);

    res.status(500).json({
      message: "Failed to delete course",
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
