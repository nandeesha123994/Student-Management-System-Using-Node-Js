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
    inactiveStudents: 0
  });

  useEffect(() => {
    const getDashboardStats = async () => {
      try {
        const response = await api.get("/dashboard");

        setStats(response.data.data);
      } catch (error) {
        console.error("Dashboard Error:", error);
      }
    };

    getDashboardStats();
  }, []);

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content">
          <h1>Dashboard</h1>
          <p>Welcome to Student Management System</p>

          <br />

          <div className="stats-container">
  <div className="stat-card">
    <h3>Total Students</h3>
    <h2>{stats.totalStudents}</h2>
  </div>

  <div className="stat-card">
    <h3>Total Courses</h3>
    <h2>{stats.totalCourses}</h2>
  </div>

  <div className="stat-card">
    <h3>Active Students</h3>
    <h2>{stats.activeStudents}</h2>
  </div>

  <div className="stat-card">
    <h3>Inactive Students</h3>
    <h2>{stats.inactiveStudents}</h2>
  </div>
</div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;