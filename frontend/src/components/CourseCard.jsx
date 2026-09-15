export default function CourseCard({ course, footer }) {
  if (!course) {
    return null;
  }

  return (
    <article className="card">
      <div className="card-icon">
        {course.title?.charAt(0)?.toUpperCase() || "C"}
      </div>

      <span className="badge">
        {course.category || "General"}
      </span>

      <h3>{course.title}</h3>

      <p className="muted card-description">
        {course.description ||
          "Explore this course and start learning."}
      </p>

      {course.instructor?.username && (
        <p className="instructor-line">
          Taught by{" "}
          <strong>{course.instructor.username}</strong>
        </p>
      )}

      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </article>
  );
}