import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function CourseStudents() {
  const { id } = useParams();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/courses/${id}/students`)
      .then((res) =>
        setEnrollments(res.data.data)
      )
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            "Failed to load students."
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="center">
        <div className="spinner" />
        <p className="muted">
          Loading enrolled students...
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <Link
        to="/instructor/dashboard"
        className="back-link"
      >
        ← Back to My Courses
      </Link>

      <div className="page-header">
        <div>
          <div className="page-kicker">
            Course analytics
          </div>

          <h1 className="page-title">
            Enrolled Students
          </h1>

          <p className="page-subtitle">
            Students currently enrolled in this course.
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            STUDENTS
          </div>

          <div className="stat-value">
            {enrollments.length}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>

          <h3>No students yet</h3>

          <p className="muted">
            Students will appear here when they enroll.
          </p>
        </div>
      ) : (
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Status</th>
                <th>Enrolled On</th>
              </tr>
            </thead>

            <tbody>
              {enrollments.map((enrollment) => (
                <tr key={enrollment._id}>
                  <td>
                    <strong>
                      {enrollment.student?.username}
                    </strong>
                  </td>

                  <td>
                    {enrollment.student?.email}
                  </td>

                  <td>
                    <span
                      className={`status-pill ${enrollment.status}`}
                    >
                      {enrollment.status}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      enrollment.createdAt
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}