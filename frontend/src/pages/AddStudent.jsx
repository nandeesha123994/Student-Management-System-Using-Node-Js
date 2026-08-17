import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import "../styles/Forms.css";

function AddStudent() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    courseId: ""
  });

  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await api.get("/courses");
        setCourses(response.data.courses);
      } catch (error) {
        console.error("Get Courses Error:", error);
      }
    };

    getCourses();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/students", {
        ...formData,
        courseId: Number(formData.courseId)
      });

      alert("Student added successfully");
      navigate("/students");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add student");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content form-page">
          <h1>Add Student</h1>

          <form className="form-container" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />

            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
            >
              <option value="">Select Course</option>

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>

            <button type="submit">Add Student</button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default AddStudent;