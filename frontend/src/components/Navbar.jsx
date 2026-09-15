import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.username
    ? user.username.substring(0, 1).toUpperCase()
    : "?";

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <img src="/logo-mark.png" alt="" className="brand-mark brand-mark-image" />
            <span className="brand-copy">
              Learn<span>Hub</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="nav-links">
            {!user && (
              <>
                <Link to="/login" className="nav-underline">
                  Login
                </Link>
                <Link to="/register" className="nav-cta">
                  Get Started
                </Link>
              </>
            )}

            {user?.role === "student" && (
              <>
                <Link
                  to="/courses"
                  className={`nav-underline ${isActive("/courses") ? "active" : ""}`}
                >
                  Explore
                </Link>
                <Link
                  to="/my-enrollments"
                  className={`nav-underline ${isActive("/my-enrollments") ? "active" : ""}`}
                >
                  My Learning
                </Link>
                <Link
                  to="/recommendations"
                  className={`nav-underline ${isActive("/recommendations") ? "active" : ""}`}
                >
                  AI Advisor
                </Link>
              </>
            )}

            {user?.role === "instructor" && (
              <>
                <Link
                  to="/instructor/dashboard"
                  className={`nav-underline ${isActive("/instructor/dashboard") ? "active" : ""}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/instructor/courses/new"
                  className={`nav-underline ${isActive("/instructor/courses/new") ? "active" : ""}`}
                >
                  Create Course
                </Link>
              </>
            )}

            {user && (
              <>
                <span className="nav-divider" />
                <span className="user-chip">
                  <span className="user-avatar">{initials}</span>
                  {user.username}
                </span>
                <button className="nav-logout" onClick={handleLogout}>
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            )}
          </nav>

          {/* Mobile burger */}
          <button
            className="nav-burger"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="mobile-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="mobile-menu-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <button
                className="mobile-menu-close"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X size={22} />
              </button>

              {!user && (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Get Started</Link>
                </>
              )}

              {user?.role === "student" && (
                <>
                  <Link to="/courses">Explore</Link>
                  <Link to="/my-enrollments">My Learning</Link>
                  <Link to="/recommendations">AI Advisor</Link>
                </>
              )}

              {user?.role === "instructor" && (
                <>
                  <Link to="/instructor/dashboard">Dashboard</Link>
                  <Link to="/instructor/courses/new">Create Course</Link>
                </>
              )}

              {user && (
                <button onClick={handleLogout}>
                  <LogOut size={16} style={{ marginRight: 8, verticalAlign: -3 }} />
                  Logout ({user.username})
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}