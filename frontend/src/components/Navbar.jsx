import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2>Student Management System</h2>

      <button onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default Navbar;