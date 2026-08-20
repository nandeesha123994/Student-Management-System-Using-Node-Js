import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/Forms.css";

function EditStudent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotification } = useNotification();

  const [courses, setCourses] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    status: "ACTIVE",
    courseId: "",
  });

  useEffect(() => {
    const getData = async () => {
      try {
        // Get student details
        const studentResponse = await api.get(`/students/${id}`);
        const student = studentResponse.data.student;

        setFormData({
          name: student.name,
          email: student.email,
          phone: student.phone,
          gender: student.gender,
          address: student.address || "",
          status: student.status,
          courseId: student.courseId,
        });

        // Get courses
        const courseResponse = await api.get("/courses");
        const activeCourses = (courseResponse.data.courses || []).filter(
          (course) => course.status === "ACTIVE",
        );

        const currentCourseStillExists = (
          courseResponse.data.courses || []
        ).some((course) => course.id === student.courseId);

        setCourses(
          currentCourseStillExists
            ? courseResponse.data.courses
            : activeCourses,
        );
      } catch (error) {
        console.error("Get Student Error:", error);
        showNotification("Failed to load student data", "error");
      }
    };

    getData();
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
      await api.put(`/students/${id}`, {
        ...formData,
        courseId: Number(formData.courseId),
      });

      showNotification("Student updated successfully", "success");
      navigate("/students");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to update student",
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
              <h1>Edit Student</h1>
              <p>Update student profile information</p>
            </div>

            <button
              type="button"
              className="back-dashboard-btn"
              onClick={() => navigate("/students")}
            >
              ← Back to Students
            </button>
          </div>

          <form className="form-container" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <br />
            <br />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <br />
            <br />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <br />
            <br />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>

            <br />
            <br />

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />

            <br />
            <br />

            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>

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

            <button type="submit">Update Student</button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default EditStudent;
