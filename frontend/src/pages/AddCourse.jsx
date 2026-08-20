import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/Forms.css";

function AddCourse() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    status: "ACTIVE",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/courses", formData);

      showNotification("Course added successfully", "success");
      navigate("/courses");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to add course",
        "error",
      );
    }
  };

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content form-page">
          <div className="form-header">
            <div>
              <h1>Add Course</h1>
              <p>Create a new course</p>
            </div>

            <button
              type="button"
              className="back-dashboard-btn"
              onClick={() => navigate("/courses")}
            >
              ← Back to Courses
            </button>
          </div>

          <form className="form-container" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Course Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <br />
            <br />

            <textarea
              name="description"
              placeholder="Course Description"
              value={formData.description}
              onChange={handleChange}
            />

            <br />
            <br />

            <input
              type="text"
              name="duration"
              placeholder="Duration (Example: 6 Months)"
              value={formData.duration}
              onChange={handleChange}
              required
            />

            <br />
            <br />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <br />
            <br />

            <button type="submit">Add Course</button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default AddCourse;
