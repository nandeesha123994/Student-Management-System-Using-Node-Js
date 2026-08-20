import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/Announcements.css";

function Announcements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Get all announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await api.get("/announcements");
      setAnnouncements(response.data.announcements);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to fetch announcements",
        "error",
      );
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Create or Update Announcement
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      showNotification("Title and message are required", "error");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, {
          title,
          message,
        });

        showNotification("Announcement updated successfully", "success");
      } else {
        await api.post("/announcements", {
          title,
          message,
        });

        showNotification("Announcement created successfully", "success");
      }

      setTitle("");
      setMessage("");
      setEditingId(null);

      fetchAnnouncements();
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Something went wrong",
        "error",
      );
    }
  };

  // Edit Announcement
  const handleEdit = (announcement) => {
    setTitle(announcement.title);
    setMessage(announcement.message);
    setEditingId(announcement.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete Announcement
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this announcement?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/announcements/${id}`);

      showNotification("Announcement deleted successfully", "success");

      fetchAnnouncements();
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to delete announcement",
        "error",
      );
    }
  };

  const handleCancelEdit = () => {
    setTitle("");
    setMessage("");
    setEditingId(null);
  };

  return (
    <div className="announcements-page">
      <div className="announcements-header">
        <div>
          <h1>📢 Announcements</h1>
          <p>Create and manage announcements for students.</p>
        </div>

        <button
          className="back-dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      <div className="announcement-form-card">
        <h2>{editingId ? "✏️ Edit Announcement" : "➕ Create Announcement"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Announcement Title</label>

            <input
              type="text"
              placeholder="Enter announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Message</label>

            <textarea
              placeholder="Write your announcement message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
            />
          </div>

          <div className="announcement-form-actions">
            <button type="submit" className="announcement-submit-btn">
              {editingId ? "Update Announcement" : "Publish Announcement"}
            </button>

            {editingId && (
              <button
                type="button"
                className="announcement-cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ANNOUNCEMENT LIST */}
      <div className="announcement-list-section">
        <h2>All Announcements</h2>

        {announcements.length === 0 ? (
          <div className="no-announcements">No announcements available.</div>
        ) : (
          <div className="announcement-list">
            {announcements.map((announcement) => (
              <div className="announcement-card" key={announcement.id}>
                <div className="announcement-card-top">
                  <div>
                    <h3>{announcement.title}</h3>

                    <p className="announcement-date">
                      📅 {new Date(announcement.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="announcement-actions">
                    <button
                      className="edit-announcement-btn"
                      onClick={() => handleEdit(announcement)}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="delete-announcement-btn"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                <p className="announcement-message">{announcement.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Announcements;
