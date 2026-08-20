import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showNotification("Please enter your email", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email,
      });

      showNotification(response.data.message, "success");

      navigate("/reset-password", {
        state: {
          email: response.data.email,
          userType: response.data.userType,
        },
      });
      // Next step: after backend is ready, navigate to reset password page
      // navigate("/reset-password");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Something went wrong",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-icon">🔐</div>

        <h1>Forgot Password?</h1>

        <p>
          Enter your registered email address and we'll help you reset your
          password.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>

        <button
          type="button"
          className="back-to-login"
          onClick={() => navigate("/login")}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
