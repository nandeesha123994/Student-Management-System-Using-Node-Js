import { Link } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <h3>Menu</h3>

      <Link to="/dashboard">Dashboard</Link>
      <Link to="/students">Students</Link>
      <Link to="/courses">Courses</Link>
    </aside>
  );
}

export default Sidebar;