import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import Courses from "./pages/Courses";
import AddCourse from "./pages/AddCourse";
import EditCourse from "./pages/EditCourse";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
                  <Route
  path="/students"
  element={
    <ProtectedRoute>
      <Students />
    </ProtectedRoute>
  }
/>      <Route
  path="/students/add"
  element={
    <ProtectedRoute>
      <AddStudent />
    </ProtectedRoute>
  }
/>
<Route
  path="/students/edit/:id"
  element={
    <ProtectedRoute>
      <EditStudent />
    </ProtectedRoute>
  }
/>
  <Route
  path="/courses"
  element={
    <ProtectedRoute>
      <Courses />
    </ProtectedRoute>
  }
/>
<Route
  path="/courses/add"
  element={
    <ProtectedRoute>
      <AddCourse />
    </ProtectedRoute>
  }
/>
<Route
  path="/courses/edit/:id"
  element={
    <ProtectedRoute>
      <EditCourse />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;