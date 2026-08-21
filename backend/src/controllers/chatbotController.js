const { Ollama } = require("ollama");
const prisma = require("../config/prisma");

// ============================================================
// INTENT DETECTION
// Keyword-based classifier – returns a Set of data categories
// needed to answer the student's question.
// ============================================================
function detectIntents(message) {
  const msg = message.toLowerCase();
  const intents = new Set();

  // LEAVE
  if (
    /leave|approved|rejected|pending|admin.?reply|reply|vacation|leave.?status|leave.?request|leave.?history/i.test(msg)
  ) {
    intents.add("leave");
  }

  // ATTENDANCE
  if (
    /attendance|present|absent|percentage|classes|attend/i.test(msg)
  ) {
    intents.add("attendance");
  }

  // COURSE
  if (
    /course|enrolled|enrollment|duration|subject|programme|program|how many student/i.test(msg)
  ) {
    intents.add("course");
  }

  // PROFILE
  if (
    /profile|my name|my email|my phone|my address|my gender|my status|account|who am i|when did i enroll|enrollment date/i.test(msg)
  ) {
    intents.add("profile");
  }

  // DOUBTS
  if (
    /doubt|question|query|pending doubt|answered doubt/i.test(msg)
  ) {
    intents.add("doubt");
  }

  // ANNOUNCEMENTS
  if (
    /announcement|notice|news|update|latest announcement/i.test(msg)
  ) {
    intents.add("announcement");
  }

  // If nothing matched, default to profile + leave (most common)
  if (intents.size === 0) {
    intents.add("profile");
    intents.add("leave");
  }

  return intents;
}

// ============================================================
// DATA FETCHERS – each fetches only what's needed
// ============================================================

async function fetchProfile(studentId) {
  return prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      gender: true,
      address: true,
      enrollmentDate: true,
      status: true,
      course: {
        select: { name: true, description: true, duration: true, status: true },
      },
    },
  });
}

async function fetchLeaves(studentId) {
  return prisma.leaveRequest.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    take: 10, // last 10 requests are enough for context
  });
}

async function fetchAttendance(studentId) {
  return prisma.attendance.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
    select: { date: true, status: true },
  });
}

async function fetchDoubts(studentId) {
  return prisma.doubt.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    select: { id: true, question: true, reply: true, status: true, createdAt: true },
  });
}

async function fetchAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { title: true, message: true, createdAt: true },
  });
}

// Course intent may need course-level enrollment count
async function fetchCourseContext(studentId, message) {
  // Check if the question names a specific course
  const courses = await prisma.course.findMany({
    select: {
      name: true,
      description: true,
      duration: true,
      status: true,
      _count: { select: { students: true } },
    },
  });

  return courses;
}

// ============================================================
// CONTEXT BUILDERS – convert raw Prisma data to readable text
// ============================================================

function buildProfileContext(student) {
  if (!student) return "Student profile not found.";
  return `Student Profile:
- Name: ${student.name}
- Email: ${student.email}
- Phone: ${student.phone}
- Gender: ${student.gender}
- Address: ${student.address || "N/A"}
- Enrollment Date: ${new Date(student.enrollmentDate).toLocaleDateString()}
- Account Status: ${student.status}
- Course: ${student.course?.name || "N/A"} (${student.course?.duration || "N/A"}, ${student.course?.status || "N/A"})`;
}

function buildLeaveContext(leaves) {
  if (!leaves || leaves.length === 0) return "Leave Requests: No leave requests found.";
  const formatted = leaves.map((l, i) => {
    return `Leave #${i + 1}:
  - Dates: ${new Date(l.fromDate).toLocaleDateString()} to ${new Date(l.toDate).toLocaleDateString()}
  - Reason: ${l.reason}
  - Status: ${l.status}
  - Admin Reply: ${l.adminReply ? `"${l.adminReply}"` : "None"}
  - Applied On: ${new Date(l.createdAt).toLocaleDateString()}`;
  });
  return `Leave Request History (most recent first):\n${formatted.join("\n\n")}`;
}

function buildAttendanceContext(records) {
  if (!records || records.length === 0) return "Attendance: No attendance records found.";
  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = total - present;
  const pct = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
  return `Attendance Summary:
- Total Classes: ${total}
- Present: ${present}
- Absent: ${absent}
- Attendance Percentage: ${pct}%`;
}

function buildDoubtContext(doubts) {
  if (!doubts || doubts.length === 0) return "Doubts: No doubts submitted yet.";
  const formatted = doubts.map((d, i) => {
    return `Doubt #${i + 1} [${d.status}]:
  - Question: ${d.question}
  - Reply: ${d.reply ? `"${d.reply}"` : "No reply yet"}
  - Asked On: ${new Date(d.createdAt).toLocaleDateString()}`;
  });
  return `Doubt History (most recent first):\n${formatted.join("\n\n")}`;
}

function buildAnnouncementContext(announcements) {
  if (!announcements || announcements.length === 0)
    return "Announcements: No announcements available.";
  const formatted = announcements.map((a, i) => {
    return `Announcement #${i + 1} - "${a.title}" (${new Date(a.createdAt).toLocaleDateString()}):\n  ${a.message}`;
  });
  return `Latest Announcements:\n${formatted.join("\n\n")}`;
}

function buildCourseContext(courses) {
  if (!courses || courses.length === 0) return "Courses: No courses found.";
  const formatted = courses.map((c) => {
    return `- ${c.name}: ${c.description || "No description"} | Duration: ${c.duration} | Status: ${c.status} | Enrolled Students: ${c._count.students}`;
  });
  return `Available Courses:\n${formatted.join("\n")}`;
}

// ============================================================
// MAIN CONTROLLER
// ============================================================

const askChatbot = async (req, res) => {
  try {
    const { message } = req.body;

    // 1. Role verification: Students only
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        message: "Access denied. Chatbot is available for students only.",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Please enter a message." });
    }

    // 2. SECURITY: studentId always from JWT, never from frontend
    const studentId = Number(req.user.id);

    // 3. Detect what data categories are needed
    const intents = detectIntents(message);

    // 4. Always fetch profile (needed to address student by name)
    const student = await fetchProfile(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student record not found." });
    }

    // 5. Fetch only the required data based on detected intents
    const contextParts = [];

    // Profile context is always added
    contextParts.push(buildProfileContext(student));

    if (intents.has("leave")) {
      const leaves = await fetchLeaves(studentId);
      contextParts.push(buildLeaveContext(leaves));
    }

    if (intents.has("attendance")) {
      const attendance = await fetchAttendance(studentId);
      contextParts.push(buildAttendanceContext(attendance));
    }

    if (intents.has("doubt")) {
      const doubts = await fetchDoubts(studentId);
      contextParts.push(buildDoubtContext(doubts));
    }

    if (intents.has("announcement")) {
      const announcements = await fetchAnnouncements();
      contextParts.push(buildAnnouncementContext(announcements));
    }

    if (intents.has("course")) {
      const courses = await fetchCourseContext(studentId, message);
      contextParts.push(buildCourseContext(courses));
    }

    const combinedContext = contextParts.join("\n\n---\n\n");

    // 6. Build system prompt with only the relevant data
    const systemPrompt = `You are a helpful AI assistant for the Student Management System.
You are talking to student: "${student.name}".

The following data has been securely retrieved from the database for this student only:

${combinedContext}

INSTRUCTIONS:
1. Answer the student's question accurately using ONLY the data provided above.
2. For leave questions: refer to the most recent leave if not specified.
3. For attendance: use the summary stats provided.
4. For course enrollment counts: state the exact number provided.
5. For announcements: summarize the latest ones.
6. For doubts: refer to the status and replies provided.
7. If the requested information is not in the context, say you don't have that information.
8. Do NOT invent any data. Do NOT expose emails, passwords, or database credentials.
9. If the question is completely unrelated to the Student Management System, politely say you can only help with student, course, attendance, leave, doubt, and announcement information.
10. Keep responses concise, friendly, and clear.`;

    // 7. Call local Ollama
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";

    const ollama = new Ollama({ host: ollamaBaseUrl });

    const response = await ollama.chat({
      model: ollamaModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message.trim() },
      ],
      stream: false,
      options: {
        temperature: 0.4,
        num_predict: 400,
      },
    });

    const botAnswer =
      response.message?.content || "Sorry, I could not generate an answer.";

    return res.status(200).json({ answer: botAnswer });
  } catch (error) {
    console.error("Chatbot Controller Error:", error);

    // Ollama is not running locally
    if (
      error.code === "ECONNREFUSED" ||
      error.cause?.code === "ECONNREFUSED"
    ) {
      return res.status(503).json({
        message:
          "AI service is not running. Please start Ollama locally by running: ollama run llama3.2",
      });
    }

    return res.status(500).json({
      message: error.message || "Failed to process chatbot request",
    });
  }
};

module.exports = {
  askChatbot,
};

