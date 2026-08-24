const prisma = require("../config/prisma");

// ================= STUDENT ASK DOUBT =================
const createDoubt = async (req, res) => {
  try {
    const { studentId, question } = req.body;

    if (!studentId || !question?.trim()) {
      return res.status(400).json({
        message: "Student ID and question are required",
      });
    }

    const doubt = await prisma.doubt.create({
      data: {
        studentId: Number(studentId),
        question: question.trim(),
      },
    });

    return res.status(201).json({
      message: "Doubt submitted successfully",
      doubt,
    });
  } catch (error) {
    console.error("Create Doubt Error:", error);

    return res.status(500).json({
      message: "Failed to submit doubt",
    });
  }
};

// ================= STUDENT GET MY DOUBTS WITH PAGINATION =================
const getMyDoubts = async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [doubts, totalDoubts] = await Promise.all([
      prisma.doubt.findMany({
        where: {
          studentId,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.doubt.count({
        where: {
          studentId,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalDoubts / limit);

    return res.status(200).json({
      message: "Doubts fetched successfully",
      doubts,
      totalDoubts,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Get My Doubts Error:", error);

    return res.status(500).json({
      message: "Failed to fetch doubts",
    });
  }
};

// ================= ADMIN GET ALL DOUBTS WITH PAGINATION =================
const getAllDoubts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [doubts, totalDoubts] = await Promise.all([
      prisma.doubt.findMany({
        skip,
        take: limit,
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
          createdAt: "desc",
        },
      }),

      prisma.doubt.count(),
    ]);

    const totalPages = Math.ceil(totalDoubts / limit);

    return res.status(200).json({
      message: "Doubts fetched successfully",
      doubts,
      totalDoubts,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Get All Doubts Error:", error);

    return res.status(500).json({
      message: "Failed to fetch doubts",
    });
  }
};

// ================= ADMIN REPLY TO DOUBT =================
const replyToDoubt = async (req, res) => {
  try {
    const doubtId = Number(req.params.id);
    const { reply } = req.body;

    if (!reply?.trim()) {
      return res.status(400).json({
        message: "Reply is required",
      });
    }

    const doubt = await prisma.doubt.update({
      where: {
        id: doubtId,
      },
      data: {
        reply: reply.trim(),
        status: "ANSWERED",
      },
    });

    return res.status(200).json({
      message: "Reply sent successfully",
      doubt,
    });
  } catch (error) {
    console.error("Reply To Doubt Error:", error);

    return res.status(500).json({
      message: "Failed to send reply",
    });
  }
};

// ================= ADMIN: GET PENDING DOUBTS COUNT =================
const getPendingDoubtsCount = async (req, res) => {
  try {
    const count = await prisma.doubt.count({
      where: {
        status: "PENDING",
      },
    });

    return res.status(200).json({
      count,
    });
  } catch (error) {
    console.error("Get Pending Doubts Count Error:", error);

    return res.status(500).json({
      message: "Failed to get pending doubts count",
    });
  }
};

module.exports = {
  createDoubt,
  getMyDoubts,
  getAllDoubts,
  replyToDoubt,
  getPendingDoubtsCount,
};
