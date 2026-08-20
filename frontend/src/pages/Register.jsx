import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
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

        const activeCourses = response.data.courses.filter(
          (course) => course.status === "ACTIVE",
        );

        setCourses(activeCourses);
      } catch (error) {
        console.error("Get Courses Error:", error);
      }
    };

    getCourses();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    // Phone: only numbers and maximum 10 digits
    if (name === "phone") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    // Remove error for this field when user starts correcting it
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must contain at least 3 characters";
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be 8+ characters with uppercase, lowercase and number";
    }

    // Phone
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    // Gender
    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    // Course
    if (!formData.courseId) {
      newErrors.courseId = "Please select a course";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await api.post("/students/register", {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        courseId: Number(formData.courseId),
      });

      showNotification("Registration successful! Please login.", "success");

      navigate("/login");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Registration failed",
        "error",
      );
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side */}
        <div className="register-left">
          <div>
            <div className="register-icon">🎓</div>

            <h1>Join Our Student Portal</h1>

            <div className="register-line"></div>

            <p>
              Create your account, select your course and access your student
              dashboard.
            </p>
          </div>

          <div className="register-footer">Student Management System</div>
        </div>

        {/* Right Side */}
        <div className="register-right">
          <div className="register-form-wrapper">
            <h2>Student Registration</h2>

            <p className="register-subtitle">Create your student account</p>

            <form
              className="register-form"
              onSubmit={handleSubmit}
              autoComplete="off"
              noValidate
            >
              {/* Name */}
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && (
                <small className="field-error">{errors.name}</small>
              )}

              {/* Email */}
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && (
                <small className="field-error">{errors.email}</small>
              )}

              {/* Password */}
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={errors.password ? "input-error" : ""}
              />
              {errors.password && (
                <small className="field-error">{errors.password}</small>
              )}

              {/* Phone */}
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                placeholder="Enter 10 digit phone number"
                value={formData.phone}
                onChange={handleChange}
                inputMode="numeric"
                maxLength="10"
                className={errors.phone ? "input-error" : ""}
              />
              {errors.phone && (
                <small className="field-error">{errors.phone}</small>
              )}

              {/* Gender */}
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={errors.gender ? "input-error" : ""}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.gender && (
                <small className="field-error">{errors.gender}</small>
              )}

              {/* Address */}
              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
              />

              {/* Course */}
              <label>Course</label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className={errors.courseId ? "input-error" : ""}
              >
                <option value="">Select Course</option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              {errors.courseId && (
                <small className="field-error">{errors.courseId}</small>
              )}

              <button type="submit">Create Account</button>

              <p className="register-login">
                Already have an account?{" "}
                <span onClick={() => navigate("/login")}>Login here</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
