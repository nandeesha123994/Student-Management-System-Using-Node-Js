import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/AdminDoubts.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminDoubts() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState({});
  const [sendingId, setSendingId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  // Get all student doubts
  const fetchDoubts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/doubts", {
        params: {
          page: currentPage,
          limit: limit,
        },
      });

      setDoubts(response.data.doubts || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Fetch Doubts Error:", error);

      showNotification(
        error.response?.data?.message || "Failed to fetch student doubts",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch doubts when page changes
  useEffect(() => {
    fetchDoubts();
  }, [currentPage]);

  // Send reply
  const handleReply = async (doubtId) => {
    const reply = replies[doubtId];

    if (!reply || !reply.trim()) {
      showNotification("Please enter a reply", "error");
      return;
    }

    try {
      setSendingId(doubtId);

      await api.put(`/doubts/${doubtId}/reply`, {
        reply: reply.trim(),
      });

      showNotification("Reply sent successfully", "success");

      setReplies((prev) => ({
        ...prev,
        [doubtId]: "",
      }));

      fetchDoubts();
    } catch (error) {
      console.error("Reply Doubt Error:", error);

      showNotification(
        error.response?.data?.message || "Failed to send reply",
        "error",
      );
    } finally {
      setSendingId(null);
    }
  };

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

  // Loading
  if (loading) {
    return <p className="admin-doubt-loading">Loading student doubts...</p>;
  }

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content admin-doubts-page">
          {/* HEADER */}
          <div className="admin-doubts-header">
            <div>
              <h1>💬 Student Doubts</h1>
              <p>View and reply to questions asked by students.</p>
            </div>

            {/* <button
              className="admin-doubts-back-btn"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button> */}
          </div>

          {/* DOUBTS LIST */}
          {doubts.length === 0 ? (
            <div className="admin-doubts-empty">
              <span>💬</span>
              <h2>No Doubts Yet</h2>
              <p>Students haven't asked any questions yet.</p>
            </div>
          ) : (
            <>
              <div className="admin-doubts-list">
                {doubts.map((doubt) => (
                  <div className="admin-doubt-card" key={doubt.id}>
                    {/* STUDENT DETAILS */}
                    <div className="admin-doubt-student">
                      <div className="admin-student-avatar">
                        {doubt.student?.name?.charAt(0).toUpperCase() || "S"}
                      </div>

                      <div>
                        <h3>{doubt.student?.name || "Unknown Student"}</h3>
                        <p>{doubt.student?.email || "No email"}</p>
                      </div>

                      <span
                        className={`admin-doubt-status ${
                          doubt.status === "ANSWERED"
                            ? "admin-status-answered"
                            : "admin-status-pending"
                        }`}
                      >
                        {doubt.status}
                      </span>
                    </div>

                    {/* QUESTION */}
                    <div className="admin-doubt-question">
                      <strong>❓ Student Question</strong>
                      <p>{doubt.question}</p>
                    </div>

                    {/* REPLY */}
                    {doubt.status === "ANSWERED" ? (
                      <div className="admin-doubt-reply">
                        <strong>💬 Your Reply</strong>
                        <p>{doubt.reply}</p>
                      </div>
                    ) : (
                      <div className="admin-reply-section">
                        <label>Write your reply</label>

                        <textarea
                          placeholder="Type your answer here..."
                          value={replies[doubt.id] || ""}
                          onChange={(e) =>
                            setReplies((prev) => ({
                              ...prev,
                              [doubt.id]: e.target.value,
                            }))
                          }
                          rows="4"
                        />

                        <button
                          className="admin-send-reply-btn"
                          onClick={() => handleReply(doubt.id)}
                          disabled={sendingId === doubt.id}
                        >
                          {sendingId === doubt.id
                            ? "Sending..."
                            : "Send Reply →"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>

                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="pagination-btn"
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
      </div>
    </div>
  );
}

export default AdminDoubts;
