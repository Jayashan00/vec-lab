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
      .then((res) => setEnrollments(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load students"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="muted center">Loading enrolled students...</p>;

  return (
    <div>
      <Link to="/instructor/dashboard" className="back-link">&larr; Back to My Courses</Link>
      <h2>Enrolled Students</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {enrollments.length === 0 && <p className="muted">No students have enrolled in this course yet.</p>}

      {enrollments.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Enrolled On</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment._id}>
                <td>{enrollment.student?.username}</td>
                <td>{enrollment.student?.email}</td>
                <td>{enrollment.status}</td>
                <td>{new Date(enrollment.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
