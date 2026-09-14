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
      const [courseRes, enrollmentsRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get("/enrollments/my"),
      ]);
      setCourse(courseRes.data.data);
      setIsEnrolled(enrollmentsRes.data.data.some((e) => e.course?._id === id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEnroll = async () => {
    setMessage("");
    setError("");
    try {
      const res = await api.post(`/enrollments/${id}`);
      setMessage(res.data.message || "Enrollment completed successfully!");
      setIsEnrolled(true);
    } catch (err) {
      setError(err.response?.data?.message || "Enrollment failed");
    }
  };

  if (loading) return <p className="muted center">Loading...</p>;
  if (error && !course) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="detail-card">
      <Link to="/courses" className="back-link">&larr; Back to courses</Link>
      <span className="badge">{course.category || "General"}</span>
      <h2>{course.title}</h2>
      <p className="instructor-line">Instructor: {course.instructor?.username}</p>

      <h4>Description</h4>
      <p>{course.description}</p>

      <h4>Course Content</h4>
      <p className="content-block">{course.content}</p>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {isEnrolled ? (
        <span className="status-pill enrolled">You are enrolled in this course</span>
      ) : (
        <button className="btn-primary" onClick={handleEnroll}>Enroll Now</button>
      )}
    </div>
  );
}
