import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../api/axios";
import "../styles/Sidebar.css";

function Sidebar() {
  const [pendingDoubts, setPendingDoubts] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);

  // Get pending doubts count
  const fetchPendingDoubtsCount = async () => {
    try {
      const response = await api.get("/doubts/pending/count");
      setPendingDoubts(response.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch pending doubts count:", error);
    }
  };

  // Get pending leave requests count
  const fetchPendingLeavesCount = async () => {
    try {
      const response = await api.get("/leave-requests/pending/count");
      setPendingLeaves(response.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch pending leave count:", error);
    }
  };

  useEffect(() => {
    fetchPendingDoubtsCount();
    fetchPendingLeavesCount();
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-menu-title">MAIN MENU</div>

      <nav className="sidebar-links">
        <NavLink to="/dashboard">
          <span className="sidebar-icon">▦</span>
          Dashboard
        </NavLink>

        <NavLink to="/students">
          <span className="sidebar-icon">👨‍🎓</span>
          Students
        </NavLink>

        <NavLink to="/courses">
          <span className="sidebar-icon">📚</span>
          Courses
        </NavLink>

        <NavLink to="/attendance">
          <span className="sidebar-icon">📅</span>
          Attendance
        </NavLink>

        <NavLink to="/announcements" className="sidebar-link">
          <span className="sidebar-icon">📢</span>
          Announcements
        </NavLink>

        {/* LEAVE REQUESTS TAB */}
        <NavLink to="/leave-requests" className="sidebar-link">
          <span className="sidebar-icon">📝</span>
          Leave Requests
          {pendingLeaves > 0 && (
            <span className="doubt-notification-badge">
              🔴 {pendingLeaves} New
            </span>
          )}
        </NavLink>

        {/* STUDENT DOUBTS TAB */}
        <NavLink to="/admin-doubts" className="sidebar-link">
          <span className="sidebar-icon">💬</span>
          Student Doubts
          {pendingDoubts > 0 && (
            <span className="doubt-notification-badge">
              🔴 {pendingDoubts} New
            </span>
          )}
        </NavLink>
      </nav>

      <div className="sidebar-footer">Student Management System</div>
    </aside>
  );
}

export default Sidebar;
