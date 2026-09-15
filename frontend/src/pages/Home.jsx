import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page">
      <section className="hero-shell">
        <div className="hero-content">
          <div className="hero-eyebrow">
            ✦ Smarter learning starts here
          </div>

          <h1>
            Learn with purpose.
            <br />
            <span className="hero-gradient-text">
              Grow with confidence.
            </span>
          </h1>

          <p className="hero-description">
            LearnHub connects ambitious learners with practical courses,
            expert instructors, and AI-powered recommendations tailored
            to where you want to go.
          </p>

          {!user && (
            <div className="hero-actions">
              <Link to="/register" className="btn-primary">
                Start Learning →
              </Link>

              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
            </div>
          )}

          {user?.role === "student" && (
            <div className="hero-actions">
              <Link to="/courses" className="btn-primary">
                Explore Courses →
              </Link>

              <Link to="/recommendations" className="btn-secondary">
                ✦ Ask AI Advisor
              </Link>
            </div>
          )}

          {user?.role === "instructor" && (
            <div className="hero-actions">
              <Link
                to="/instructor/dashboard"
                className="btn-primary"
              >
                Open Dashboard →
              </Link>

              <Link
                to="/instructor/courses/new"
                className="btn-secondary"
              >
                Create Course
              </Link>
            </div>
          )}

          <div className="home-stats">
            <div className="home-stat">
              <strong>Practical</strong>
              Career-focused learning
            </div>

            <div className="home-stat">
              <strong>AI-powered</strong>
              Personalized discovery
            </div>

            <div className="home-stat">
              <strong>Built for growth</strong>
              Learn at your pace
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card main">
            <div className="float-label">YOUR LEARNING PATH</div>

            <div className="float-title">
              Full Stack Development
            </div>

            <div className="float-progress">
              <span />
            </div>

            <p className="float-label">72% learning progress</p>
          </div>

          <div className="floating-card small-one">
            <div className="float-label">AI ADVISOR</div>

            <div className="float-title">
              ✦ 5 courses matched
            </div>
          </div>

          <div className="floating-card small-two">
            <div className="float-label">NEXT STEP</div>

            <div className="float-title">
              Keep learning 🚀
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}