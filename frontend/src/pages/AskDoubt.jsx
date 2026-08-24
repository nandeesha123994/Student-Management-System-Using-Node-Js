import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/AskDoubt.css";

function AskDoubt() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [question, setQuestion] = useState("");
  const [doubts, setDoubts] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");

  // Get student's doubts with pagination
  const fetchMyDoubts = async () => {
    try {
      setPageLoading(true);

      const response = await api.get(`/doubts/student/${studentId}`, {
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
        error.response?.data?.message || "Failed to fetch doubts",
        "error",
      );
    } finally {
      setPageLoading(false);
    }
  };

  // Fetch doubts when page changes
  useEffect(() => {
    if (studentId) {
      fetchMyDoubts();
    } else {
      setPageLoading(false);
    }
  }, [currentPage, studentId]);

  // Submit doubt
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      showNotification("Please enter your doubt", "error");
      return;
    }

    if (!studentId) {
      showNotification("Student ID not found. Please login again.", "error");
      return;
    }

    try {
      setLoading(true);

      await api.post("/doubts", {
        studentId: Number(studentId),
        question: question.trim(),
      });

      showNotification("Doubt submitted successfully", "success");

      setQuestion("");

      // After submitting, go to first page
      setCurrentPage(1);

      // If already on page 1, refresh manually
      if (currentPage === 1) {
        fetchMyDoubts();
      }
    } catch (error) {
      console.error("Submit Doubt Error:", error);

      showNotification(
        error.response?.data?.message || "Failed to submit doubt",
        "error",
      );
    } finally {
      setLoading(false);
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

  if (pageLoading) {
    return <p className="doubt-loading">Loading your doubts...</p>;
  }

  return (
    <main className="doubt-page">
      <div className="doubt-header">
        <div>
          <h1>💬 Ask a Doubt</h1>
          <p>Ask the admin any question and get a reply.</p>
        </div>

        <button
          className="doubt-back-btn"
          onClick={() => navigate("/student-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="doubt-content">
        {/* Ask Doubt Form */}
        <section className="doubt-form-card">
          <h2>Ask Your Question</h2>

          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="Type your question or doubt here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows="6"
            />

            <button
              type="submit"
              className="doubt-submit-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Doubt →"}
            </button>
          </form>
        </section>

        {/* Previous Doubts */}
        <section className="doubt-history-card">
          <h2>My Doubts</h2>

          {doubts.length === 0 ? (
            <p className="doubt-empty">You haven't asked any doubts yet.</p>
          ) : (
            <>
              <div className="doubt-list">
                {doubts.map((doubt) => (
                  <div className="doubt-card" key={doubt.id}>
                    <div className="doubt-question">
                      <strong>❓ Your Question</strong>
                      <p>{doubt.question}</p>
                    </div>

                    <span
                      className={`doubt-status ${
                        doubt.status === "ANSWERED"
                          ? "doubt-answered"
                          : "doubt-pending"
                      }`}
                    >
                      {doubt.status}
                    </span>

                    {doubt.reply && (
                      <div className="doubt-reply">
                        <strong>💬 Admin Reply</strong>
                        <p>{doubt.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="doubt-pagination">
                  <button onClick={handlePrevious} disabled={currentPage === 1}>
                    ← Previous
                  </button>

                  <span>
                    Page {currentPage} of {totalPages}
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
        </section>
      </div>
    </main>
  );
}

export default AskDoubt;
