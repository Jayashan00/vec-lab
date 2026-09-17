import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CourseCard from "../components/CourseCard";

export default function MyEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/enrollments/my")
      .then((res) => setEnrollments(res.data.data))
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            "Failed to load enrollments."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="center">
        <div className="spinner" />
        <p className="muted">
          Loading your learning...
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-kicker">
            Your journey
          </div>

          <h1 className="page-title">
            My Learning
          </h1>

          <p className="page-subtitle">
            Courses you've enrolled in and your learning
            progress.
          </p>
        </div>

        <Link
          to="/courses"
          className="btn-primary"
        >
          Explore More →
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📖</div>

          <h3>Your learning library is empty</h3>

          <p className="muted">
            Find a course and start learning today.
          </p>

          <Link
            to="/courses"
            className="btn-primary"
            style={{ marginTop: "12px" }}
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid">
          {enrollments.map((enrollment) => {
            const totalLessons = enrollment.course?.lessons?.length || 0;
            const doneLessons = enrollment.completedLessons?.length || 0;
            const percent =
              totalLessons > 0
                ? Math.round((doneLessons / totalLessons) * 100)
                : 0;

            return (
              <CourseCard
                key={enrollment._id}
                course={enrollment.course}
                footer={
                  <div className="card-actions" style={{ flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
                    {totalLessons > 0 && (
                      <div>
                        <div className="learn-progress-track small">
                          <div
                            className="learn-progress-fill"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="muted" style={{ fontSize: "0.78rem" }}>
                          {doneLessons}/{totalLessons} lessons · {percent}%
                        </span>
                      </div>
                    )}

                    <div className="card-actions">
                      <Link
                        to={
                          totalLessons > 0
                            ? `/courses/${enrollment.course._id}/learn`
                            : `/courses/${enrollment.course._id}`
                        }
                        className="btn-secondary small"
                      >
                        Continue →
                      </Link>

                      <span
                        className={`status-pill ${enrollment.status}`}
                      >
                        {enrollment.status}
                      </span>
                    </div>
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}