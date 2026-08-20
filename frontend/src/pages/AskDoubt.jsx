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
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");

  // Get student's doubts
  const fetchMyDoubts = async () => {
    try {
      const response = await api.get(`/doubts/student/${studentId}`);
      setDoubts(response.data || []);
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

  useEffect(() => {
    if (studentId) {
      fetchMyDoubts();
    } else {
      setPageLoading(false);
    }
  }, []);

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
      fetchMyDoubts();
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
          )}
        </section>
      </div>
    </main>
  );
}

export default AskDoubt;
