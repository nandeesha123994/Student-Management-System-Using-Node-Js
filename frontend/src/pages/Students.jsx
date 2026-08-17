import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../styles/Students.css";

function Students() {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const getStudents = async () => {
    try {
      const response = await api.get("/students");

      setStudents(response.data.students);
    } catch (error) {
      console.error("Get Students Error:", error);
    }
  };

  useEffect(() => {
    getStudents();
  }, []);

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this student?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/students/${id}`);

    alert("Student deleted successfully");

    // Refresh student list
    getStudents();

  } catch (error) {
    alert(error.response?.data?.message || "Failed to delete student");
  }
};
const filteredStudents = students.filter((student) =>
  student.name.toLowerCase().includes(search.toLowerCase()) ||
  student.email.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content students-page">
          <h1>Students</h1>
          <input
  type="text"
  placeholder="Search by name or email..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

<button onClick={() => navigate("/students/add")}>
  Add Student
</button>

<br /><br />

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Course</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.phone}</td>
                  <td>{student.course?.name}</td>
                  <td>{student.status}</td>
                  <td>
  <button onClick={() => navigate(`/students/edit/${student.id}`)}>
    Edit
  </button>

  <button onClick={() => handleDelete(student.id)}>
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

export default Students;