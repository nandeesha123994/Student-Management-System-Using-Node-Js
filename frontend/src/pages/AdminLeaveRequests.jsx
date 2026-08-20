import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/AdminLeaveRequests.css";

function AdminLeaveRequests() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch all leave requests
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);

      const response = await api.get("/leave-requests");

      setLeaveRequests(response.data.leaveRequests || []);
    } catch (error) {
      console.error("Fetch Leave Requests Error:", error);

      showNotification(
        error.response?.data?.message || "Failed to fetch leave requests",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Approve leave
  const handleApprove = async (id) => {
    try {
      setUpdatingId(id);

      await api.put(`/leave-requests/${id}`, {
        status: "APPROVED",
      });

      showNotification("Leave request approved successfully", "success");

      fetchLeaveRequests();
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to approve leave request",
        "error",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Reject leave
  const handleReject = async (id) => {
    try {
      setUpdatingId(id);

      await api.put(`/leave-requests/${id}`, {
        status: "REJECTED",
      });

      showNotification("Leave request rejected successfully", "success");

      fetchLeaveRequests();
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to reject leave request",
        "error",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === "APPROVED") return "admin-leave-approved";
    if (status === "REJECTED") return "admin-leave-rejected";
    return "admin-leave-pending";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <p className="admin-leave-loading">Loading leave requests...</p>;
  }

  return (
    <main className="admin-leave-page">
      <div className="admin-leave-header">
        <div>
          <h1>Leave Requests</h1>
          <p>Manage student leave requests.</p>
        </div>

        <button
          className="admin-leave-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      <section className="admin-leave-card">
        <h2>📋 All Leave Requests</h2>

        {leaveRequests.length === 0 ? (
          <p className="admin-leave-empty">No leave requests found.</p>
        ) : (
          <div className="admin-leave-list">
            {leaveRequests.map((leave) => (
              <div className="admin-leave-request-card" key={leave.id}>
                <div className="admin-leave-request-header">
                  <div>
                    <h3>{leave.student?.name || "Unknown Student"}</h3>

                    <p>{leave.student?.email}</p>

                    <span className="admin-leave-course">
                      🎓 {leave.student?.course?.name || "No Course"}
                    </span>
                  </div>

                  <span
                    className={`admin-leave-status ${getStatusClass(
                      leave.status,
                    )}`}
                  >
                    {leave.status}
                  </span>
                </div>

                <div className="admin-leave-details">
                  <div>
                    <strong>From:</strong> {formatDate(leave.fromDate)}
                  </div>

                  <div>
                    <strong>To:</strong> {formatDate(leave.toDate)}
                  </div>
                </div>

                <div className="admin-leave-reason">
                  <strong>Reason:</strong>
                  <p>{leave.reason}</p>
                </div>

                <div className="admin-leave-footer">
                  <span>Requested on: {formatDate(leave.createdAt)}</span>

                  {leave.status === "PENDING" && (
                    <div className="admin-leave-actions">
                      <button
                        className="admin-approve-btn"
                        onClick={() => handleApprove(leave.id)}
                        disabled={updatingId === leave.id}
                      >
                        ✓ Approve
                      </button>

                      <button
                        className="admin-reject-btn"
                        onClick={() => handleReject(leave.id)}
                        disabled={updatingId === leave.id}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminLeaveRequests;
