const prisma = require("../config/prisma");

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await prisma.student.count();

    const totalCourses = await prisma.course.count();

    const activeStudents = await prisma.student.count({
      where: {
        status: "ACTIVE"
      }
    });

    const inactiveStudents = await prisma.student.count({
      where: {
        status: "INACTIVE"
      }
    });

    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      data: {
        totalStudents,
        totalCourses,
        activeStudents,
        inactiveStudents
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = { getDashboardStats };