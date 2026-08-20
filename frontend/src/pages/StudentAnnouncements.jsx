import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/StudentAnnouncements.css";

function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get("/announcements");

        setAnnouncements(response.data.announcements);
      } catch (error) {
        console.error("Announcement Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <main className="student-announcements-page">
      <div className="student-announcements-header">
        <div>
          <h1>📢 Announcements</h1>
          <p>Stay updated with the latest announcements.</p>
        </div>

        <button
          className="back-dashboard-btn"
          onClick={() => navigate("/student-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {loading ? (
        <p className="student-announcement-loading">Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <div className="student-no-announcements">
          📭 No announcements available.
        </div>
      ) : (
        <div className="student-announcement-list">
          {announcements.map((announcement) => (
            <div className="student-announcement-card" key={announcement.id}>
              <h2>{announcement.title}</h2>

              <p className="student-announcement-date">
                📅 {new Date(announcement.createdAt).toLocaleString()}
              </p>

              <p className="student-announcement-message">
                {announcement.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default StudentAnnouncements;
