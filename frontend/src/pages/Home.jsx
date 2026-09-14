import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="hero">
      <h1>Learn new skills with LearnHub</h1>
      <p className="muted">
        Browse courses from real instructors, enroll instantly, and get
        AI-powered course recommendations tailored to your career goals.
      </p>

      {!user && (
        <div className="hero-actions">
          <Link to="/register" className="btn-primary">Get Started</Link>
          <Link to="/login" className="btn-secondary">Login</Link>
        </div>
      )}

      {user && user.role === "student" && (
        <div className="hero-actions">
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
          <Link to="/recommendations" className="btn-secondary">Ask GPT for Ideas</Link>
        </div>
      )}

      {user && user.role === "instructor" && (
        <div className="hero-actions">
          <Link to="/instructor/dashboard" className="btn-primary">Go to Dashboard</Link>
          <Link to="/instructor/courses/new" className="btn-secondary">Create a Course</Link>
        </div>
      )}
    </div>
  );
}
