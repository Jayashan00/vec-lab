import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page center">
      <div className="empty-state">
        <div
          style={{
            fontSize: "4rem",
            fontWeight: 900,
            letterSpacing: "-0.08em",
          }}
        >
          404
        </div>

        <h2>Looks like you're lost.</h2>

        <p className="muted">
          The page you're looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="btn-primary"
          style={{ marginTop: "12px" }}
        >
          Back to LearnHub
        </Link>
      </div>
    </div>
  );
}