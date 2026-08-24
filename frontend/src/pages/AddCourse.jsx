import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/Forms.css";

function AddCourse() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    status: "ACTIVE",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Remove error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Course name is required";
    }

    if (!formData.duration.trim()) {
      newErrors.duration = "Course duration is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check validation before API call
    if (!validateForm()) {
      return;
    }

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
            {/* Course Name */}
            <div className="form-field">
              <input
                type="text"
                name="name"
                placeholder="Course Name"
                value={formData.name}
                onChange={handleChange}
              />

              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="form-field">
              <textarea
                name="description"
                placeholder="Course Description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Duration */}
            <div className="form-field">
              <input
                type="text"
                name="duration"
                placeholder="Duration (Example: 6 Months)"
                value={formData.duration}
                onChange={handleChange}
              />

              {errors.duration && (
                <p className="field-error">{errors.duration}</p>
              )}
            </div>

            {/* Status */}
            <div className="form-field">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <button type="submit">Add Course</button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default AddCourse;
