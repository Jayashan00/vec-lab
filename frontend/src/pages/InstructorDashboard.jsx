import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = () => {
    setLoading(true);

    api
      .get("/courses/mine/list")
      .then((res) => setCourses(res.data.data))
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            "Failed to load your courses."
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this course? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/courses/${id}`);

      setCourses((prev) =>
        prev.filter((c) => c._id !== id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete course."
      );
    }
  };

  if (loading) {
    return (
      <div className="center">
        <div className="spinner" />
        <p className="muted">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  const totalStudents = courses.reduce(
    (sum, course) =>
      sum + (course.enrollmentCount || 0),
    0
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-kicker">
            Instructor workspace
          </div>

          <h1 className="page-title">
            Your teaching dashboard
          </h1>

          <p className="page-subtitle">
            Create, manage, and grow your courses.
          </p>
        </div>

        <Link
          to="/instructor/courses/new"
          className="btn-primary"
        >
          + Create Course
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="dashboard-stat-grid">
        <div className="stat-card">
          <div className="stat-label">
            TOTAL COURSES
          </div>

          <div className="stat-value">
            {courses.length}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            TOTAL STUDENTS
          </div>

          <div className="stat-value">
            {totalStudents}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            ACTIVE CONTENT
          </div>

          <div className="stat-value">
            {courses.length > 0 ? "Ready" : "Start"}
          </div>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✦</div>

          <h3>Create your first course</h3>

          <p className="muted">
            Share your knowledge and help students build
            valuable skills.
          </p>

          <Link
            to="/instructor/courses/new"
            className="btn-primary"
            style={{ marginTop: "12px" }}
          >
            Create Course →
          </Link>
        </div>
      ) : (
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>
                    <strong>{course.title}</strong>
                  </td>

                  <td>
                    <span className="badge">
                      {course.category || "General"}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {course.enrollmentCount || 0}
                    </strong>
                  </td>

                  <td className="actions-cell">
                    <Link
                      to={`/instructor/courses/${course._id}/edit`}
                      className="btn-secondary small"
                    >
                      Edit
                    </Link>

                    <Link
                      to={`/instructor/courses/${course._id}/students`}
                      className="btn-secondary small"
                    >
                      Students
                    </Link>

                    <button
                      className="btn-danger small"
                      onClick={() =>
                        handleDelete(course._id)
                      }
                    >
                      Delete
                    </button>
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