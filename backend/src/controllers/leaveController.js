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

    // Validate required fields
    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({
        message: "From date, To date and reason are required",
      });
    }

    // Validate dates
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

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        studentId: student.id,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        reason: reason.trim(),
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
// STUDENT: GET MY LEAVE REQUESTS WITH PAGINATION
// ==========================================
const getMyLeaves = async (req, res) => {
  try {
    const studentId = Number(req.user.id);

    // Get page and limit from query
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    // Calculate records to skip
    const skip = (page - 1) * limit;

    // Get paginated leave requests and total count
    const [leaveRequests, totalLeaves] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: {
          studentId,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.leaveRequest.count({
        where: {
          studentId,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalLeaves / limit);

    return res.status(200).json({
      message: "Leave requests fetched successfully",
      leaveRequests,
      totalLeaves,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Get My Leaves Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// ADMIN: GET ALL LEAVE REQUESTS WITH PAGINATION
// ==========================================
const getAllLeaves = async (req, res) => {
  try {
    // Get page and limit from query
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    // Calculate records to skip
    const skip = (page - 1) * limit;

    // Get paginated leave requests and total count
    const [leaveRequests, totalLeaves] = await Promise.all([
      prisma.leaveRequest.findMany({
        skip,
        take: limit,
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
      }),

      prisma.leaveRequest.count(),
    ]);

    const totalPages = Math.ceil(totalLeaves / limit);

    return res.status(200).json({
      message: "Leave requests fetched successfully",
      leaveRequests,
      totalLeaves,
      totalPages,
      currentPage: page,
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
    const { status, adminReply } = req.body;

    // Validate status
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be APPROVED or REJECTED",
      });
    }

    const updateData = {
      status,
    };

    // Add admin reply if provided
    if (adminReply !== undefined) {
      updateData.adminReply = adminReply ? adminReply.trim() : null;
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: {
        id: Number(id),
      },
      data: updateData,
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
