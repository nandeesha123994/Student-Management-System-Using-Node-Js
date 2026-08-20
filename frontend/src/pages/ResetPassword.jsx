import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import "../styles/ResetPassword.css";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const { email, userType } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !userType) {
      showNotification("Invalid password reset request", "error");
      navigate("/forgot-password");
      return;
    }

    if (newPassword.length < 6) {
      showNotification("Password must be at least 6 characters", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        email,
        userType,
        newPassword,
      });

      showNotification(response.data.message, "success");

      navigate("/login");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to reset password",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-icon">🔑</div>

        <h1>Reset Password</h1>

        <p>
          Create a new password for
          <br />
          <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <label>New Password</label>

          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label>Confirm Password</label>

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Reset Password"}
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

export default ResetPassword;
