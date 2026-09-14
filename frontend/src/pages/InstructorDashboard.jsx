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
      .catch((err) => setError(err.response?.data?.message || "Failed to load your courses"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course? This cannot be undone.")) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  if (loading) return <p className="muted center">Loading your courses...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>My Courses</h2>
        <Link to="/instructor/courses/new" className="btn-primary small">+ Add Course</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {courses.length === 0 && <p className="muted">You haven't created any courses yet.</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Enrolled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course._id}>
              <td>{course.title}</td>
              <td>{course.category}</td>
              <td>{course.enrollmentCount}</td>
              <td className="actions-cell">
                <Link to={`/instructor/courses/${course._id}/edit`} className="btn-secondary small">Edit</Link>
                <Link to={`/instructor/courses/${course._id}/students`} className="btn-secondary small">Students</Link>
                <button className="btn-danger small" onClick={() => handleDelete(course._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
