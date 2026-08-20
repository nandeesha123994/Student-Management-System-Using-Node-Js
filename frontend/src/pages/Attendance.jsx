import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/Attendance.css";

function Attendance() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  const { showNotification } = useNotification();

  // Get active courses
  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await api.get("/courses");

        const activeCourses = (response.data.courses || []).filter(
          (course) => course.status === "ACTIVE",
        );

        setCourses(activeCourses);
      } catch (error) {
        console.error("Get Courses Error:", error);
        showNotification("Failed to load courses", "error");
      }
    };

    getCourses();
  }, []);

  // Load students by selected course
  const handleLoadStudents = async () => {
    if (!courseId) {
      showNotification("Please select a course", "error");
      return;
    }

    if (!date) {
      showNotification("Please select a date", "error");
      return;
    }

    try {
      const response = await api.get(`/attendance/students/course/${courseId}`);

      const studentList = response.data.students || [];

      setStudents(studentList);

      // Default all students to PRESENT
      const initialAttendance = {};

      studentList.forEach((student) => {
        initialAttendance[student.id] = "PRESENT";
      });

      setAttendance(initialAttendance);

      if (studentList.length === 0) {
        showNotification("No active students found", "error");
      }
    } catch (error) {
      console.error("Load Students Error:", error);

      showNotification(
        error.response?.data?.message || "Failed to load students",
        "error",
      );
    }
  };

  // Change attendance status
  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      showNotification("Please load students first", "error");
      return;
    }

    try {
      const attendanceData = students.map((student) => ({
        studentId: student.id,
        status: attendance[student.id],
      }));

      await api.post("/attendance", {
        courseId: Number(courseId),
        date,
        attendance: attendanceData,
      });

      showNotification("Attendance saved successfully", "success");
    } catch (error) {
      console.error("Save Attendance Error:", error);

      showNotification(
        error.response?.data?.message || "Failed to save attendance",
        "error",
      );
    }
  };

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content attendance-page">
          <h1>Attendance</h1>

          {/* Select Course and Date */}
          <div className="attendance-controls">
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setStudents([]);
              }}
            >
              <option value="">Select Course</option>

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button onClick={handleLoadStudents}>Load Students</button>
          </div>

          {/* Student Attendance List */}
          {students.length > 0 && (
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>

                      <td>{student.name}</td>

                      <td>{student.email}</td>

                      <td>
                        <select
                          value={attendance[student.id] || "PRESENT"}
                          onChange={(e) =>
                            handleStatusChange(student.id, e.target.value)
                          }
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                className="save-attendance-btn"
                onClick={handleSaveAttendance}
              >
                Save Attendance
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Attendance;
