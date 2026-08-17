import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import "../styles/Forms.css";

function EditCourse() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    status: "ACTIVE"
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
          status: course.status
        });
      } catch (error) {
        console.error("Get Course Error:", error);
        alert("Failed to load course data");
      }
    };

    getCourse();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/courses/${id}`, formData);

      alert("Course updated successfully");
      navigate("/courses");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update course");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content form-page">
          <h1>Edit Course</h1>

          <form className="form-container" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Course Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <br /><br />

            <textarea
              name="description"
              placeholder="Course Description"
              value={formData.description}
              onChange={handleChange}
            />

            <br /><br />

            <input
              type="text"
              name="duration"
              placeholder="Duration"
              value={formData.duration}
              onChange={handleChange}
              required
            />

            <br /><br />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <br /><br />

            <button type="submit">Update Course</button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default EditCourse;