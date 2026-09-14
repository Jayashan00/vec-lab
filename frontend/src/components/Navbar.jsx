import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        LearnHub
      </Link>

      <nav className="nav-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-link">Sign Up</Link>
          </>
        )}

        {user && user.role === "student" && (
          <>
            <Link to="/courses">Courses</Link>
            <Link to="/my-enrollments">My Enrollments</Link>
            <Link to="/recommendations">Ask GPT</Link>
          </>
        )}

        {user && user.role === "instructor" && (
          <>
            <Link to="/instructor/dashboard">My Courses</Link>
            <Link to="/instructor/courses/new">Add Course</Link>
          </>
        )}

        {user && (
          <>
            <span className="user-chip">{user.username} ({user.role})</span>
            <button className="btn-link" onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}
