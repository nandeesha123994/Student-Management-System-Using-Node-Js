const prisma = require("../config/prisma");

// ================= STUDENT ASK DOUBT =================
const createDoubt = async (req, res) => {
  try {
    const { studentId, question } = req.body;

    if (!studentId || !question) {
      return res.status(400).json({
        message: "Student ID and question are required",
      });
    }

    const doubt = await prisma.doubt.create({
      data: {
        studentId: Number(studentId),
        question,
      },
    });

    res.status(201).json({
      message: "Doubt submitted successfully",
      doubt,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to submit doubt",
    });
  }
};

// ================= STUDENT GET MY DOUBTS =================
const getMyDoubts = async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);

    const doubts = await prisma.doubt.findMany({
      where: {
        studentId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(doubts);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch doubts",
    });
  }
};

// ================= ADMIN GET ALL DOUBTS =================
const getAllDoubts = async (req, res) => {
  try {
    const doubts = await prisma.doubt.findMany({
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
    });

    res.status(200).json(doubts);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch doubts",
    });
  }
};

// ================= ADMIN REPLY TO DOUBT =================
const replyToDoubt = async (req, res) => {
  try {
    const doubtId = Number(req.params.id);
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({
        message: "Reply is required",
      });
    }

    const doubt = await prisma.doubt.update({
      where: {
        id: doubtId,
      },
      data: {
        reply,
        status: "ANSWERED",
      },
    });

    res.status(200).json({
      message: "Reply sent successfully",
      doubt,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
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

    res.status(200).json({
      count,
    });
  } catch (error) {
    console.error("Get Pending Doubts Count Error:", error);

    res.status(500).json({
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
