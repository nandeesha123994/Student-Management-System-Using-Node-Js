import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/Forms.css";

function EditCourse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    const getCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        const course = response.data.course;

        setFormData({
          name: course.name,
          description: course.description || "",
          duration: course.duration,
          status: course.status,
        });
      } catch (error) {
        console.error("Get Course Error:", error);
        showNotification("Failed to load course data", "error");
      }
    };

    getCourse();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/courses/${id}`, formData);

      showNotification("Course updated successfully", "success");
      navigate("/courses");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to update course",
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
              <h1>Edit Course</h1>
              <p>Update course details and status</p>
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
              placeholder="Duration"
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

            <button type="submit">Update Course</button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default EditCourse;
