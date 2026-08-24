const prisma = require("../config/prisma");

// ==========================================
// CREATE ANNOUNCEMENT
// ==========================================
const createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: "Title and message are required",
      });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        message: message.trim(),
      },
    });

    return res.status(201).json({
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    console.error("Create Announcement Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL ANNOUNCEMENTS (pagination implemented)
// ==========================================
const getAllAnnouncements = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const [announcements, totalAnnouncements] = await Promise.all([
      prisma.announcement.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.announcement.count(),
    ]);

    const totalPages = Math.ceil(totalAnnouncements / limit);

    return res.status(200).json({
      message: "Announcements fetched successfully",
      announcements,
      totalAnnouncements,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Get Announcements Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE ANNOUNCEMENT
// ==========================================
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message } = req.body;

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingAnnouncement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    const announcement = await prisma.announcement.update({
      where: {
        id: Number(id),
      },
      data: {
        title: title?.trim(),
        message: message?.trim(),
      },
    });

    return res.status(200).json({
      message: "Announcement updated successfully",
      announcement,
    });
  } catch (error) {
    console.error("Update Announcement Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// DELETE ANNOUNCEMENT
// ==========================================
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingAnnouncement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    await prisma.announcement.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete Announcement Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
