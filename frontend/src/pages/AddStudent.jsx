import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/Forms.css";

function AddStudent() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    courseId: "",
  });

  // Get active courses
  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await api.get("/courses");

        const activeCourses = (response.data.courses || []).filter(
          (course) => course.status === "ACTIVE",
        );

        setCourses(activeCourses);
      } catch (error) {
        console.error("Get Courses Error:", error);
      }
    };

    getCourses();
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone =
        "Phone must start with 6, 7, 8, or 9 and contain 10 digits";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Please select gender";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    // Course validation
    if (!formData.courseId) {
      newErrors.courseId = "Please select a course";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle normal fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Handle phone - only numbers and maximum 10 digits
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));

    setErrors((prev) => ({
      ...prev,
      phone: "",
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await api.post("/students", {
        ...formData,
        courseId: Number(formData.courseId),
      });

      showNotification("Student added successfully", "success");

      setFormData({
        name: "",
        email: "",
        phone: "",
        gender: "",
        address: "",
        courseId: "",
      });

      setErrors({});

      navigate("/students");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to add student",
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
              <h1>Add Student</h1>
              <p>Register a new student</p>
            </div>

            <button
              type="button"
              className="back-dashboard-btn"
              onClick={() => navigate("/students")}
            >
              ← Back to Students
            </button>
          </div>

          <form
            className="form-container"
            onSubmit={handleSubmit}
            autoComplete="off"
            noValidate
          >
            {/* Name */}
            <div className="form-field">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />

              {errors.name && (
                <span className="field-error">{errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-field">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
              />

              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            {/* Phone */}
            <div className="form-field">
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength={10}
              />

              {errors.phone && (
                <span className="field-error">{errors.phone}</span>
              )}
            </div>

            {/* Gender */}
            <div className="form-field">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>

              {errors.gender && (
                <span className="field-error">{errors.gender}</span>
              )}
            </div>

            {/* Address */}
            <div className="form-field">
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />

              {errors.address && (
                <span className="field-error">{errors.address}</span>
              )}
            </div>

            {/* Course */}
            <div className="form-field">
              {courses.length === 0 ? (
                <p className="no-active-courses-message">
                  No active courses available. Please add or activate a course
                  first.
                </p>
              ) : (
                <>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                  >
                    <option value="">Select Course</option>

                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>

                  {errors.courseId && (
                    <span className="field-error">{errors.courseId}</span>
                  )}
                </>
              )}
            </div>

            <button type="submit" disabled={courses.length === 0}>
              Add Student
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default AddStudent;
