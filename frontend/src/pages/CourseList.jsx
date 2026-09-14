import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CourseCard from "../components/CourseCard";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.get("/courses"),
        api.get("/enrollments/my"),
      ]);
      setCourses(coursesRes.data.data);
      setEnrolledIds(new Set(enrollmentsRes.data.data.map((e) => e.course?._id)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = async (courseId) => {
    setMessage("");
    setError("");
    try {
      const res = await api.post(`/enrollments/${courseId}`);
      setMessage(res.data.message || "Enrollment completed successfully!");
      setEnrolledIds((prev) => new Set(prev).add(courseId));
    } catch (err) {
      setError(err.response?.data?.message || "Enrollment failed");
    }
  };

  if (loading) return <p className="muted center">Loading courses...</p>;

  return (
    <div>
      <h2>Available Courses</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {courses.length === 0 && <p className="muted">No courses are available yet.</p>}

      <div className="grid">
        {courses.map((course) => {
          const isEnrolled = enrolledIds.has(course._id);
          return (
            <CourseCard
              key={course._id}
              course={course}
              footer={
                <div className="card-actions">
                  <Link to={`/courses/${course._id}`} className="btn-secondary small">
                    View Details
                  </Link>
                  {isEnrolled ? (
                    <span className="status-pill enrolled">Enrolled</span>
                  ) : (
                    <button className="btn-primary small" onClick={() => handleEnroll(course._id)}>
                      Enroll
                    </button>
                  )}
                </div>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
