import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "STUDENT") {
        localStorage.setItem("studentId", user.id);
      }

      showNotification("Login successful", "success");

      if (user.role === "ADMIN") {
        navigate("/dashboard");
      } else if (user.role === "STUDENT") {
        navigate("/student-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Login failed",
        "error",
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side */}
        <div className="login-left">
          <div>
            <div className="login-icon">🎓</div>

            <h1>Student Management System</h1>

            <div className="blue-line"></div>

            <p>
              Manage students, courses and academic information efficiently in
              one place.
            </p>
          </div>

          <div className="login-footer-text">Admin & Student Portal</div>
        </div>

        {/* Right Side */}
        <div className="login-right">
          <div className="login-form-wrapper">
            <h2>Login</h2>

            <p className="login-subtitle">
              Welcome back! Please login to your account.
            </p>

            <form
              className="login-form"
              onSubmit={handleLogin}
              autoComplete="off"
            >
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />

              <label htmlFor="password">Password</label>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div
                className="login-options-row"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  width: "100%",
                  marginTop: "0px",
                  marginBottom: "20px",
                  textAlign: "right",
                }}
              >
                <a
                  href="/forgot-password"
                  className="forgot-password-link"
                  style={{
                    marginLeft: "auto",
                    display: "inline-block",
                    color: "#1d4ed8",
                    fontSize: "14px",
                    fontWeight: "600",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/forgot-password");
                  }}
                >
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="login-submit-btn">
                Login
              </button>
            </form>

            <div
              className="login-register-footer"
              style={{
                marginTop: "24px",
                textAlign: "center",
                width: "100%",
              }}
            >
              Don't have an account?{" "}
              <a
                href="/register"
                className="register-link"
                style={{
                  color: "#1d4ed8",
                  fontSize: "14px",
                  fontWeight: "600",
                  textDecoration: "underline",
                  cursor: "pointer",
                  marginLeft: "4px",
                  display: "inline-block",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register");
                }}
              >
                Register Here
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
