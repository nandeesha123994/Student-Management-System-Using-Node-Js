const prisma = require("../config/prisma");

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await prisma.student.count();

    const totalCourses = await prisma.course.count();

    const activeStudents = await prisma.student.count({
      where: {
        status: "ACTIVE",
      },
    });

    const inactiveStudents = await prisma.student.count({
      where: {
        status: "INACTIVE",
      },
    });

    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        course: true,
      },
    });

    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      data: {
        totalStudents,
        totalCourses,
        activeStudents,
        inactiveStudents,
        recentStudents: recentStudents.map((student) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          course: student.course ? student.course.name : "N/A",
          status: student.status,
        })),
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { getDashboardStats };
