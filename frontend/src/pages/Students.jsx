import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import "../styles/Students.css";

function Students() {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const limit = 5;
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/students", {
        params: {
          search: search,
          page: currentPage,
          limit: limit,
        },
      });

      setStudents(response.data.students);
      setTotalPages(response.data.totalPages);
      setTotalStudents(response.data.totalStudents);
    } catch (error) {
      console.error("Get Students Error:", error);
      setError("Failed to load students. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      getStudents();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [search, currentPage]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/students/${id}`);

      showNotification("Student deleted successfully", "success");
      getStudents();
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to delete student",
        "error",
      );
    }
  };

  const filteredStudents = students.filter((student) => {
    return statusFilter === "ALL" || student.status === statusFilter;
  });

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content students-page">
          {/* Page Header */}
          <div className="students-page-header">
            <div>
              <h1>Students</h1>
              <p>Manage and view all registered students</p>
            </div>

            <button
              className="add-student-btn"
              onClick={() => navigate("/students/add")}
            >
              + Add Student
            </button>
          </div>

          {/* Search and Filter */}
          <div className="students-toolbar-card">
            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              className="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Students</option>
              <option value="ACTIVE">Active Students</option>
              <option value="INACTIVE">Inactive Students</option>
            </select>
          </div>

          {/* Students Table */}
          <div className="students-table-card">
            <div className="table-card-header">
              <div>
                <h2>All Students</h2>
                <p>
                  {totalStudents} student
                  {totalStudents !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>

            {loading ? (
              <div className="students-message">Loading students...</div>
            ) : error ? (
              <div className="students-message error-message">{error}</div>
            ) : (
              <div className="students-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th className="actions-heading">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="no-students">
                          No students found
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <tr key={student.id}>
                          <td className="student-id">
                            {(currentPage - 1) * limit + index + 1}
                          </td>

                          <td>
                            <div className="student-info">
                              <div className="student-avatar">
                                {student.name.charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <div className="student-name">
                                  {student.name}
                                </div>

                                <div className="student-email">
                                  {student.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>{student.phone}</td>

                          <td>{student.address || "N/A"}</td>

                          <td>
                            <span className="course-name">
                              {student.course?.name || "N/A"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`student-status ${
                                student.status === "ACTIVE"
                                  ? "student-active"
                                  : "student-inactive"
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                className="edit-btn"
                                onClick={() =>
                                  navigate(`/students/edit/${student.id}`)
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="delete-btn"
                                onClick={() => handleDelete(student.id)}
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
            )}
          </div>
          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ← Previous
              </button>

              <span className="pagination-info">
                Page {currentPage} of {totalPages}
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
        </main>
      </div>
    </div>
  );
}

export default Students;
