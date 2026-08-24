import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/StudentAnnouncements.css";

function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const limit = 5;

  // Fetch announcements with pagination
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      const response = await api.get("/announcements", {
        params: {
          page: currentPage,
          limit: limit,
        },
      });

      setAnnouncements(response.data.announcements || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Announcement Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch announcements when page changes
  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage]);

  // Previous page
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Next page
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

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
        <>
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

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="student-announcement-pagination">
              <button onClick={handlePrevious} disabled={currentPage === 1}>
                ← Previous
              </button>

              <span>
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong>
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default StudentAnnouncements;
