import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/AdminLeaveRequests.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AdminLeaveRequests() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [adminReplies, setAdminReplies] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  // Fetch all leave requests
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);

      const response = await api.get("/leave-requests", {
        params: {
          page: currentPage,
          limit: limit,
        },
      });

      setLeaveRequests(response.data.leaveRequests || []);
      setTotalPages(response.data.totalPages || 1);
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

  // Fetch data when page changes
  useEffect(() => {
    fetchLeaveRequests();
  }, [currentPage]);

  // Approve leave
  const handleApprove = async (id) => {
    try {
      setUpdatingId(id);

      const payload = {
        status: "APPROVED",
      };

      if (adminReplies[id]?.trim()) {
        payload.adminReply = adminReplies[id].trim();
      }

      await api.put(`/leave-requests/${id}`, payload);

      showNotification("Leave request approved successfully", "success");

      setAdminReplies((prev) => ({
        ...prev,
        [id]: "",
      }));

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

      const payload = {
        status: "REJECTED",
      };

      if (adminReplies[id]?.trim()) {
        payload.adminReply = adminReplies[id].trim();
      }

      await api.put(`/leave-requests/${id}`, payload);

      showNotification("Leave request rejected successfully", "success");

      setAdminReplies((prev) => ({
        ...prev,
        [id]: "",
      }));

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

  return (
    <div>
      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar + Main Content */}
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content admin-leave-page">
          <div className="admin-leave-header">
            <div>
              <h1>Leave Requests</h1>
              <p>Manage student leave requests.</p>
            </div>

            {/* <button
              className="admin-leave-back-btn"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button> */}
          </div>

          <section className="admin-leave-card">
            <h2>📋 All Leave Requests</h2>

            {loading && leaveRequests.length === 0 ? (
              <p className="admin-leave-loading">Loading leave requests...</p>
            ) : leaveRequests.length === 0 ? (
              <p className="admin-leave-empty">No leave requests found.</p>
            ) : (
              <>
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

                      {/* Show Admin Reply */}
                      {leave.adminReply && (
                        <div className="admin-leave-reply-display">
                          <strong>Admin Reply:</strong>
                          <p>{leave.adminReply}</p>
                        </div>
                      )}

                      {/* Reply Input for Pending Requests */}
                      {leave.status === "PENDING" && (
                        <div className="admin-leave-reply-input">
                          <label>Admin Reply (Optional):</label>

                          <textarea
                            placeholder="Type optional reply or remark..."
                            value={adminReplies[leave.id] || ""}
                            onChange={(e) =>
                              setAdminReplies((prev) => ({
                                ...prev,
                                [leave.id]: e.target.value,
                              }))
                            }
                            rows="2"
                          />
                        </div>
                      )}

                      <div className="admin-leave-footer">
                        <span>Requested on: {formatDate(leave.createdAt)}</span>

                        {leave.status === "PENDING" && (
                          <div className="admin-leave-actions">
                            <button
                              className="admin-approve-btn"
                              onClick={() => handleApprove(leave.id)}
                              disabled={updatingId === leave.id}
                            >
                              {updatingId === leave.id
                                ? "Updating..."
                                : "✓ Approve"}
                            </button>

                            <button
                              className="admin-reject-btn"
                              onClick={() => handleReject(leave.id)}
                              disabled={updatingId === leave.id}
                            >
                              {updatingId === leave.id
                                ? "Updating..."
                                : "✕ Reject"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="admin-leave-pagination">
                    <button
                      className="admin-pagination-btn"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>

                    <span className="admin-pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      className="admin-pagination-btn"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminLeaveRequests;
