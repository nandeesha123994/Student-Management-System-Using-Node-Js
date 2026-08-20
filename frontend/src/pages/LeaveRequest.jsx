import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/LeaveRequest.css";

function LeaveRequest() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Get student's leave requests
  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get("/leave-requests/my-leaves");
      setLeaveRequests(response.data.leaveRequests || []);
    } catch (error) {
      console.error("Fetch Leave Requests Error:", error);
      showNotification(
        error.response?.data?.message || "Failed to fetch leave requests",
        "error",
      );
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Submit leave request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fromDate || !toDate || !reason.trim()) {
      showNotification("Please fill all fields", "error");
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      showNotification("To date cannot be before From date", "error");
      return;
    }

    try {
      setLoading(true);

      await api.post("/leave-requests", {
        fromDate,
        toDate,
        reason: reason.trim(),
      });

      showNotification("Leave request submitted successfully", "success");

      // Clear form
      setFromDate("");
      setToDate("");
      setReason("");

      // Refresh leave requests
      fetchLeaveRequests();
    } catch (error) {
      console.error("Apply Leave Error:", error);

      showNotification(
        error.response?.data?.message || "Failed to submit leave request",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "APPROVED") return "leave-approved";
    if (status === "REJECTED") return "leave-rejected";
    return "leave-pending";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (pageLoading) {
    return <p className="leave-loading">Loading leave requests...</p>;
  }

  return (
    <main className="leave-page">
      <div className="leave-header">
        <div>
          <h1>Leave Request</h1>
          <p>Apply for leave and track your request status.</p>
        </div>

        <button
          className="leave-back-btn"
          onClick={() => navigate("/student-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="leave-content">
        {/* APPLY LEAVE FORM */}
        <section className="leave-form-card">
          <h2>📝 Apply for Leave</h2>

          <form onSubmit={handleSubmit}>
            <div className="leave-date-row">
              <div className="leave-field">
                <label>From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="leave-field">
                <label>To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className="leave-field">
              <label>Reason</label>
              <textarea
                placeholder="Enter your reason for leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="5"
              />
            </div>

            <button
              type="submit"
              className="leave-submit-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Leave Request"}
            </button>
          </form>
        </section>

        {/* LEAVE HISTORY */}
        <section className="leave-history-card">
          <h2>📋 My Leave Requests</h2>

          {leaveRequests.length === 0 ? (
            <p className="leave-empty">No leave requests found.</p>
          ) : (
            <div className="leave-list">
              {leaveRequests.map((leave) => (
                <div className="leave-request-card" key={leave.id}>
                  <div className="leave-request-top">
                    <div>
                      <h3>
                        {formatDate(leave.fromDate)} -{" "}
                        {formatDate(leave.toDate)}
                      </h3>

                      <p>{leave.reason}</p>
                    </div>

                    <span
                      className={`leave-status ${getStatusClass(leave.status)}`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  <div className="leave-request-footer">
                    Requested on: {formatDate(leave.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default LeaveRequest;
