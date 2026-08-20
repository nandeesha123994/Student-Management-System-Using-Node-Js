import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/StudentDashboard.css";

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Get profile and attendance together
        const [studentResponse, attendanceResponse] = await Promise.all([
          api.get("/students/me"),
          api.get("/attendance/my-attendance"),
        ]);

        setStudent(studentResponse.data.student);
        setAttendanceData(attendanceResponse.data);
      } catch (error) {
        console.error("Student Dashboard Error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load dashboard. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("studentId");

    showNotification("Logged out successfully", "success");

    navigate("/login");
  };

  if (loading) {
    return <p className="student-loading">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="student-error">{error}</p>;
  }

  if (!student) {
    return <p className="student-empty">No profile found.</p>;
  }

  const summary = attendanceData?.summary || {
    totalClasses: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  };

  const attendanceHistory = attendanceData?.attendance || [];

  return (
    <main className="student-dashboard-page">
      {/* HEADER */}
      <div className="student-dashboard-header">
        <div>
          <h1 className="student-dashboard-title">
            Welcome back, {student.name} 👋
          </h1>

          <p className="student-dashboard-subtitle">
            Here's your profile overview
          </p>
        </div>

        <div className="student-header-actions">
          <button
            className="student-attendance-btn"
            onClick={() => navigate("/student-attendance")}
          >
            📊 View My Attendance
          </button>

          <button
            className="student-announcements-btn"
            onClick={() => navigate("/student-announcements")}
          >
            📢 Announcements
          </button>
          <button
            className="student-leave-btn"
            onClick={() => navigate("/leave-request")}
          >
            📝 Leave Request
          </button>

          <button className="student-logout-btn" onClick={handleLogout}>
            ⇥ Logout
          </button>
        </div>
      </div>

      {/* MAIN DASHBOARD */}
      <div className="student-profile-layout">
        {/* PROFILE */}
        <section className="profile-panel">
          <div className="panel-heading">
            <div className="panel-icon">👤</div>

            <div>
              <h2 className="panel-title">Profile Information</h2>
              <div className="title-line"></div>
            </div>
          </div>

          <div className="profile-list">
            <div className="profile-item">
              <div className="item-icon">🪪</div>

              <div>
                <span className="profile-label">Full Name</span>
                <div className="profile-value">{student.name}</div>
              </div>
            </div>

            <div className="profile-item">
              <div className="item-icon">✉</div>

              <div>
                <span className="profile-label">Email Address</span>
                <div className="profile-value">{student.email}</div>
              </div>
            </div>

            <div className="profile-item">
              <div className="item-icon">📞</div>

              <div>
                <span className="profile-label">Phone Number</span>
                <div className="profile-value">{student.phone}</div>
              </div>
            </div>

            <div className="profile-item">
              <div className="item-icon">👥</div>

              <div>
                <span className="profile-label">Gender</span>
                <div className="profile-value">{student.gender}</div>
              </div>
            </div>

            <div className="profile-item address-item">
              <div className="item-icon">📍</div>

              <div>
                <span className="profile-label">Address</span>

                <div className="profile-value">{student.address || "N/A"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* COURSE AND STATUS */}
        <aside className="summary-panel">
          <div className="panel-heading">
            <div className="panel-icon course-icon">🎓</div>

            <div>
              <h2 className="panel-title">Course & Status</h2>
              <div className="title-line purple-line"></div>
            </div>
          </div>

          <div className="summary-grid">
            <div className="summary-box course-box">
              <div className="summary-icon">📖</div>

              <div>
                <span className="profile-label">Enrolled Course</span>

                <div className="profile-value course-value">
                  {student.course?.name || "N/A"}
                </div>
              </div>
            </div>

            <div className="summary-box status-box">
              <div className="summary-icon">🛡️</div>

              <div>
                <span className="profile-label">Current Status</span>

                <div
                  className={`status-badge ${
                    student.status === "ACTIVE"
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  <span className="status-dot"></span>
                  {student.status}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* NEED HELP */}
      <section className="need-help-card">
        <div className="need-help-content">
          <div className="need-help-icon">💬</div>

          <div>
            <h2>Need Help?</h2>
            <p>Have any questions or doubts?</p>
            <span>Ask the admin and get a reply.</span>
          </div>
        </div>

        <button
          className="ask-doubt-btn"
          onClick={() => navigate("/ask-doubt")}
        >
          Ask a Doubt →
        </button>
      </section>

      {/* BOTTOM INFORMATION */}
      <section className="student-info-bar">
        <div className="info-bar-item">
          <div className="info-icon">📅</div>

          <div>
            <span className="profile-label">Enrollment Date</span>

            <div className="profile-value">
              {student.enrollmentDate
                ? new Date(student.enrollmentDate).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
        </div>

        <div className="info-bar-item">
          <div className="info-icon">👤</div>

          <div>
            <span className="profile-label">Student ID</span>

            <div className="profile-value">
              STU{String(student.id).padStart(6, "0")}
            </div>
          </div>
        </div>

        <div className="info-bar-item">
          <div className="info-icon">📄</div>

          <div>
            <span className="profile-label">Account Type</span>

            <div className="profile-value">Student</div>
          </div>
        </div>

        <div className="info-bar-item">
          <div className="info-icon verified-icon">✓</div>

          <div>
            <span className="profile-label">Account Status</span>

            <div className="profile-value verified-text">Verified</div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default StudentDashboard;
