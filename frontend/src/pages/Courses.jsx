import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import "../styles/Courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const limit = 5;

  // Search
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Get courses with Search + Pagination
  const getCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/courses", {
        params: {
          search: search,
          page: currentPage,
          limit: limit,
        },
      });

      setCourses(response.data.courses);
      setTotalPages(response.data.totalPages);
      setTotalCourses(response.data.totalCourses);
    } catch (error) {
      console.error("Get Courses Error:", error);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Search and page change
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      getCourses();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [search, currentPage]);

  // Delete course
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/courses/${id}`);

      showNotification("Course deleted successfully", "success");

      getCourses();
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to delete course",
        "error",
      );
    }
  };

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content courses-page">
          {/* Header */}
          <div className="courses-header">
            <div>
              <h1>Courses</h1>
              <p>Manage all courses in one place</p>
            </div>

            <button
              className="add-course-btn"
              onClick={() => navigate("/courses/add")}
            >
              + Add Course
            </button>
          </div>

          {/* Search */}
          <div className="courses-toolbar">
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Loading */}
          {loading ? (
            <p className="courses-message">Loading courses...</p>
          ) : error ? (
            <p className="courses-message error-message">{error}</p>
          ) : (
            <>
              <div className="courses-table-card">
                <div className="courses-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Course Name</th>
                        <th>Description</th>
                        <th>Duration</th>
                        <th>Students</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {courses.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="no-courses">
                            No courses found
                          </td>
                        </tr>
                      ) : (
                        courses.map((course, index) => (
                          <tr key={course.id}>
                            <td>{(currentPage - 1) * limit + index + 1}</td>

                            <td className="course-name">{course.name}</td>

                            <td className="course-description">
                              {course.description || "No description"}
                            </td>

                            <td>{course.duration}</td>

                            <td>{course.studentCount ?? 0}</td>

                            <td>
                              <span
                                className={`course-status ${
                                  course.status === "ACTIVE"
                                    ? "course-active"
                                    : "course-inactive"
                                }`}
                              >
                                {course.status}
                              </span>
                            </td>

                            <td>
                              <div className="action-buttons">
                                <button
                                  className="edit-btn"
                                  onClick={() =>
                                    navigate(`/courses/edit/${course.id}`)
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  className="delete-btn"
                                  onClick={() => handleDelete(course.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    ← Previous
                  </button>

                  <span className="pagination-info">
                    Page {currentPage} of {totalPages} ({totalCourses} courses)
                  </span>

                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Courses;
