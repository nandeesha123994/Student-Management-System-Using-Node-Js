const prisma = require("../config/prisma");

// ==========================================
// MARK ATTENDANCE
// ==========================================
const markAttendance = async (req, res) => {
  try {
    const { courseId, date, attendance } = req.body;

    // Validate required fields
    if (!courseId || !date || !attendance || !Array.isArray(attendance)) {
      return res.status(400).json({
        message: "Course, date and attendance data are required",
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

    // Check every student belongs to selected course
    for (const item of attendance) {
      const student = await prisma.student.findFirst({
        where: {
          id: Number(item.studentId),
          courseId: Number(courseId),
          status: "ACTIVE",
        },
      });

      if (!student) {
        return res.status(400).json({
          message: `Invalid student ID: ${item.studentId}`,
        });
      }
    }

    // Create or update attendance
    const attendanceRecords = await Promise.all(
      attendance.map(async (item) => {
        return prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: Number(item.studentId),
              date: new Date(date),
            },
          },
          update: {
            status: item.status,
            courseId: Number(courseId),
          },
          create: {
            studentId: Number(item.studentId),
            courseId: Number(courseId),
            date: new Date(date),
            status: item.status,
          },
        });
      }),
    );

    return res.status(201).json({
      message: "Attendance saved successfully",
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error("Mark Attendance Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET STUDENTS FOR ATTENDANCE
// ==========================================
const getStudentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const students = await prisma.student.findMany({
      where: {
        courseId: Number(courseId),
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json({
      message: "Students fetched successfully",
      students,
    });
  } catch (error) {
    console.error("Get Students By Course Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET ATTENDANCE BY COURSE AND DATE
// ==========================================
const getAttendanceByDate = async (req, res) => {
  try {
    const { courseId, date } = req.query;

    if (!courseId || !date) {
      return res.status(400).json({
        message: "Course ID and date are required",
      });
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        courseId: Number(courseId),
        date: new Date(date),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        student: {
          name: "asc",
        },
      },
    });

    return res.status(200).json({
      message: "Attendance fetched successfully",
      attendance,
    });
  } catch (error) {
    console.error("Get Attendance Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET LOGGED-IN STUDENT ATTENDANCE
// ==========================================
const getMyAttendance = async (req, res) => {
  try {
    const studentId = Number(req.user.id);

    const attendance = await prisma.attendance.findMany({
      where: {
        studentId,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const totalClasses = attendance.length;

    const presentCount = attendance.filter(
      (item) => item.status === "PRESENT",
    ).length;

    const absentCount = attendance.filter(
      (item) => item.status === "ABSENT",
    ).length;

    const percentage =
      totalClasses === 0
        ? 0
        : Number(((presentCount / totalClasses) * 100).toFixed(2));

    return res.status(200).json({
      message: "Attendance fetched successfully",
      summary: {
        totalClasses,
        present: presentCount,
        absent: absentCount,
        percentage,
      },
      attendance,
    });
  } catch (error) {
    console.error("Get My Attendance Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  markAttendance,
  getStudentsByCourse,
  getAttendanceByDate,
  getMyAttendance,
};
