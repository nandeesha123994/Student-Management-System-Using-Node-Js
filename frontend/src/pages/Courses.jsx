import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../styles/Courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  const getCourses = async () => {
    try {
      const response = await api.get("/courses");
      setCourses(response.data.courses);
    } catch (error) {
      console.error("Get Courses Error:", error);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this course?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/courses/${id}`);

    alert("Course deleted successfully");

    // Refresh courses list
    getCourses();

  } catch (error) {
    alert(error.response?.data?.message || "Failed to delete course");
  }
};

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content courses-page">
          <h1>Courses</h1>

          <button onClick={() => navigate("/courses/add")}>
  Add Course
</button>

<br /><br />

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Course Name</th>
                <th>Description</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>{course.name}</td>
                  <td>{course.description}</td>
                  <td>{course.duration}</td>
                  <td>{course.status}</td>
                  <td>
  <button onClick={() => navigate(`/courses/edit/${course.id}`)}>
    Edit
  </button>

  <button onClick={() => handleDelete(course.id)}>
    Delete
  </button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}

export default Courses;