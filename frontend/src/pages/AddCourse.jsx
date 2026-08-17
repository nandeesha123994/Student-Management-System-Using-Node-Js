import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import "../styles/Forms.css";

function AddCourse() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    status: "ACTIVE"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/courses", formData);

      alert("Course added successfully");
      navigate("/courses");

    } catch (error) {
      alert(error.response?.data?.message || "Failed to add course");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content form-page">
          <h1>Add Course</h1>

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
              placeholder="Duration (Example: 6 Months)"
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

            <button type="submit">Add Course</button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default AddCourse;