import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import "../styles/Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeStudents: 0,
    inactiveStudents: 0,
  });

  const [recentStudents, setRecentStudents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getDashboardStats = async () => {
    try {
      setRefreshing(true);

      const response = await api.get("/dashboard");
      const dashboardData = response.data.data;

      setStats({
        totalStudents: dashboardData.totalStudents,
        totalCourses: dashboardData.totalCourses,
        activeStudents: dashboardData.activeStudents,
        inactiveStudents: dashboardData.inactiveStudents,
      });

      setRecentStudents(dashboardData.recentStudents || []);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getDashboardStats();
  }, []);

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content">
          {/* Header */}
          <div className="dashboard-hero">
            <div>
              <p className="dashboard-welcome">ADMIN DASHBOARD</p>

              <h1>Welcome back 👋</h1>

              <p className="dashboard-description">
                Here's what's happening in your Student Management System.
              </p>
            </div>

            {/* <button
              className="refresh-button"
              onClick={getDashboardStats}
              disabled={refreshing}
            >
              {refreshing ? "↻ Refreshing..." : "↻ Refresh Data"}
            </button> */}
          </div>

          {/* Statistics Cards */}
          <div className="stats-container">
            <div className="stat-card total-students-card">
              <div className="stat-icon">👨‍🎓</div>

              <div className="stat-info">
                <p>Total Students</p>
                <h2>{stats.totalStudents}</h2>
                <span>Registered students</span>
              </div>
            </div>

            <div className="stat-card total-courses-card">
              <div className="stat-icon">📚</div>

              <div className="stat-info">
                <p>Total Courses</p>
                <h2>{stats.totalCourses}</h2>
                <span>Available courses</span>
              </div>
            </div>

            <div className="stat-card active-students-card">
              <div className="stat-icon">✓</div>

              <div className="stat-info">
                <p>Active Students</p>
                <h2>{stats.activeStudents}</h2>
                <span>Currently active</span>
              </div>
            </div>

            <div className="stat-card inactive-students-card">
              <div className="stat-icon">!</div>

              <div className="stat-info">
                <p>Inactive Students</p>
                <h2>{stats.inactiveStudents}</h2>
                <span>Currently inactive</span>
              </div>
            </div>
          </div>

          {/* Recent Students */}
          <section className="recent-students-section">
            <div className="section-header">
              <div>
                <h2>Recent Students</h2>
                <p>Latest 5 registered students in the system</p>
              </div>

              <span className="student-count">
                {recentStudents.length} Students
              </span>
            </div>

            {recentStudents.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">👨‍🎓</div>
                <h3>No students found</h3>
                <p>Recently registered students will appear here.</p>
              </div>
            ) : (
              <div className="recent-students-table-wrap">
                <table className="recent-students-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar">
                              {student.name?.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <strong>{student.name}</strong>
                              <span>ID: {student.id}</span>
                            </div>
                          </div>
                        </td>

                        <td>{student.email}</td>

                        <td>
                          <span className="course-name">
                            {student.course || "No Course"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`table-status ${
                              student.status === "ACTIVE"
                                ? "table-status-active"
                                : "table-status-inactive"
                            }`}
                          >
                            <span className="status-dot"></span>
                            {student.status}
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
      </div>
    </div>
  );
}

export default Dashboard;
