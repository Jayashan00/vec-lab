import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.username
    ? user.username.substring(0, 1).toUpperCase()
    : "?";

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">L</span>

        <span className="brand-copy">
          Learn<span>Hub</span>
        </span>
      </Link>

      <nav className="nav-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>

            <Link to="/register" className="nav-cta">
              Get Started
            </Link>
          </>
        )}

        {user?.role === "student" && (
          <>
            <Link
              to="/courses"
              className={
                isActive("/courses") ? "active" : ""
              }
            >
              Explore
            </Link>

            <Link to="/my-enrollments">
              My Learning
            </Link>

            <Link to="/recommendations">
              AI Advisor
            </Link>
          </>
        )}

        {user?.role === "instructor" && (
          <>
            <Link to="/instructor/dashboard">
              Dashboard
            </Link>

            <Link to="/instructor/courses/new">
              Create Course
            </Link>
          </>
        )}

        {user && (
          <>
            <span className="user-chip">
              <span className="user-avatar">
                {initials}
              </span>

              {user.username}
            </span>

            <button
              className="nav-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}