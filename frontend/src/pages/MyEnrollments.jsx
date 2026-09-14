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
      .catch((err) => setError(err.response?.data?.message || "Failed to load enrollments"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted center">Loading your enrollments...</p>;

  return (
    <div>
      <h2>My Enrolled Courses</h2>
      {error && <div className="alert alert-error">{error}</div>}

      {enrollments.length === 0 && (
        <p className="muted">
          You haven't enrolled in any courses yet. <Link to="/courses">Browse courses</Link>
        </p>
      )}

      <div className="grid">
        {enrollments.map((enrollment) => (
          <CourseCard
            key={enrollment._id}
            course={enrollment.course}
            footer={
              <div className="card-actions">
                <Link to={`/courses/${enrollment.course._id}`} className="btn-secondary small">
                  View Details
                </Link>
                <span className={`status-pill ${enrollment.status}`}>{enrollment.status}</span>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
