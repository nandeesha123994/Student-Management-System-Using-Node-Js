import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import Courses from "./pages/Courses";
import AddCourse from "./pages/AddCourse";
import EditCourse from "./pages/EditCourse";
import Notification from "./components/Notification";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Attendance from "./pages/Attendance";
import StudentAttendance from "./pages/StudentAttendance";
import Announcements from "./pages/Announcements";
import StudentAnnouncements from "./pages/StudentAnnouncements";
import LeaveRequest from "./pages/LeaveRequest";
import AdminLeaveRequests from "./pages/AdminLeaveRequests";
import AskDoubt from "./pages/AskDoubt";
import AdminDoubts from "./pages/AdminDoubts";

function App() {
  return (
    <BrowserRouter>
      <Notification />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Students />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/add"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddStudent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <EditStudent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Courses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/add"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddCourse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <EditCourse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/announcements"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Announcements />
            </ProtectedRoute>
          }
        />

        {/* ADMIN LEAVE REQUESTS */}
        <Route
          path="/leave-requests"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLeaveRequests />
            </ProtectedRoute>
          }
        />

        {/* ================= STUDENT ROUTES ================= */}

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-attendance"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-announcements"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentAnnouncements />
            </ProtectedRoute>
          }
        />

        {/* STUDENT LEAVE REQUEST */}
        <Route
          path="/leave-request"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <LeaveRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ask-doubt"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <AskDoubt />
            </ProtectedRoute>
          }
        />
        {/* ADMIN DOUBTS */}
        <Route
          path="/admin-doubts"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDoubts />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
