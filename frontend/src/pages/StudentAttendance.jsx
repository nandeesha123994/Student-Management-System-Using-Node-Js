import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/StudentAttendance.css";

function StudentAttendance() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);

        const response = await api.get("/attendance/my-attendance");

        setAttendanceData(response.data);
      } catch (error) {
        console.error("Attendance Error:", error);

        setError(error.response?.data?.message || "Failed to load attendance.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="student-attendance-page">
        <p className="attendance-loading">Loading attendance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-attendance-page">
        <p className="attendance-error">{error}</p>
      </div>
    );
  }

  const summary = attendanceData?.summary || {
    totalClasses: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  };

  const attendanceHistory = attendanceData?.attendance || [];

  return (
    <main className="student-attendance-page">
      {/* HEADER */}
      <div className="student-attendance-header">
        <div>
          <button
            className="back-dashboard-btn"
            onClick={() => navigate("/student-dashboard")}
          >
            ← Back to Dashboard
          </button>

          <h1>📊 My Attendance</h1>

          <p>Track your attendance and class performance</p>
        </div>

        <div className="attendance-percentage-circle">
          {summary.percentage}%
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <section className="student-attendance-summary">
        <div className="student-attendance-card">
          <span>📚</span>
          <p>Total Classes</p>
          <h2>{summary.totalClasses}</h2>
        </div>

        <div className="student-attendance-card present">
          <span>✅</span>
          <p>Present</p>
          <h2>{summary.present}</h2>
        </div>

        <div className="student-attendance-card absent">
          <span>❌</span>
          <p>Absent</p>
          <h2>{summary.absent}</h2>
        </div>

        <div className="student-attendance-card percentage">
          <span>📈</span>
          <p>Attendance</p>
          <h2>{summary.percentage}%</h2>
        </div>
      </section>

      {/* PROGRESS */}
      <section className="student-attendance-progress">
        <div className="progress-title">
          <span>Overall Attendance</span>
          <strong>{summary.percentage}%</strong>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(summary.percentage, 100)}%`,
            }}
          ></div>
        </div>
      </section>

      {/* ATTENDANCE HISTORY */}
      <section className="student-attendance-history">
        <h2>Attendance History</h2>

        {attendanceHistory.length === 0 ? (
          <div className="no-attendance-record">
            No attendance records available yet.
          </div>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="student-attendance-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {attendanceHistory.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>{new Date(item.date).toLocaleDateString()}</td>

                    <td>{item.course?.name || "N/A"}</td>

                    <td>
                      <span
                        className={
                          item.status === "PRESENT"
                            ? "student-status-present"
                            : "student-status-absent"
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default StudentAttendance;
