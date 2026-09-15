import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function CourseDetail() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [courseRes, enrollmentsRes] =
        await Promise.all([
          api.get(`/courses/${id}`),
          api.get("/enrollments/my"),
        ]);

      setCourse(courseRes.data.data);

      setIsEnrolled(
        enrollmentsRes.data.data.some(
          (e) => e.course?._id === id
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load course."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleEnroll = async () => {
    setMessage("");
    setError("");

    try {
      const res = await api.post(
        `/enrollments/${id}`
      );

      setMessage(
        res.data.message ||
          "Enrollment completed successfully!"
      );

      setIsEnrolled(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Enrollment failed."
      );
    }
  };

  if (loading) {
    return (
      <div className="center">
        <div className="spinner" />
        <p className="muted">Loading course...</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="detail-card">
        <Link to="/courses" className="back-link">
          ← Back to courses
        </Link>

        <div className="detail-hero">
          <span className="badge">
            {course.category || "General"}
          </span>

          <h1>{course.title}</h1>

          <p className="instructor-line">
            Taught by{" "}
            <strong>
              {course.instructor?.username}
            </strong>
          </p>

          <div className="detail-meta">
            <span className="status-pill active">
              ✓ Practical learning
            </span>

            {isEnrolled && (
              <span className="status-pill enrolled">
                ✓ You are enrolled
              </span>
            )}
          </div>
        </div>

        <section className="detail-section">
          <h4>About this course</h4>

          <p>{course.description}</p>
        </section>

        <section className="detail-section">
          <h4>Course content</h4>

          <p className="content-block">
            {course.content}
          </p>
        </section>

        {message && (
          <div className="alert alert-success">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div style={{ marginTop: "28px" }}>
          {isEnrolled ? (
            <span className="status-pill enrolled">
              ✓ You're enrolled in this course
            </span>
          ) : (
            <button
              className="btn-primary"
              onClick={handleEnroll}
            >
              Enroll in this course →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}