export default function CourseCard({ course, footer }) {
  return (
    <div className="card">
      <span className="badge">{course.category || "General"}</span>
      <h3>{course.title}</h3>
      <p className="muted">{course.description}</p>
      {course.instructor?.username && (
        <p className="instructor-line">By {course.instructor.username}</p>
      )}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
