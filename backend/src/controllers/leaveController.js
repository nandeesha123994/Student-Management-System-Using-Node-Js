const prisma = require("../config/prisma");

// ==========================================
// STUDENT: APPLY FOR LEAVE
// ==========================================
const applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;

    // Check logged-in user is a student
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        message: "Only students can apply for leave",
      });
    }

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({
        message: "From date, To date and reason are required",
      });
    }

    if (new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({
        message: "From date cannot be greater than To date",
      });
    }

    const studentId = Number(req.user.id);

    // Check student exists
    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        studentId: student.id,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        reason,
      },
    });

    return res.status(201).json({
      message: "Leave request submitted successfully",
      leaveRequest,
    });
  } catch (error) {
    console.error("Apply Leave Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
// ==========================================
// STUDENT: GET MY LEAVE REQUESTS
// ==========================================

const getMyLeaves = async (req, res) => {
  try {
    const studentId = Number(req.user.id);

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        studentId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Leave requests fetched successfully",
      leaveRequests,
    });
  } catch (error) {
    console.error("Get My Leaves Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// ADMIN: GET ALL LEAVE REQUESTS
// ==========================================

const getAllLeaves = async (req, res) => {
  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            course: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Leave requests fetched successfully",
      leaveRequests,
    });
  } catch (error) {
    console.error("Get All Leaves Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// ADMIN: APPROVE OR REJECT LEAVE
// ==========================================

const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be APPROVED or REJECTED",
      });
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
      },
    });

    return res.status(200).json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leaveRequest,
    });
  } catch (error) {
    console.error("Update Leave Status Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// ADMIN: GET PENDING LEAVE COUNT
// ==========================================

const getPendingLeaveCount = async (req, res) => {
  try {
    const count = await prisma.leaveRequest.count({
      where: {
        status: "PENDING",
      },
    });

    return res.status(200).json({
      count,
    });
  } catch (error) {
    console.error("Get Pending Leave Count Error:", error);

    return res.status(500).json({
      message: "Failed to fetch pending leave count",
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  getPendingLeaveCount,
};
