import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, PlayCircle, Award } from "lucide-react";
import api from "../api/axios";

export default function CourseLearn() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);

  const loadData = async () => {
    try {
      const [courseRes, enrollmentRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/enrollments/course/${id}`),
      ]);

      setCourse(courseRes.data.data);
      setEnrollment(enrollmentRes.data.data);

      const lessons = courseRes.data.data.lessons || [];
      if (lessons.length > 0) setActiveLessonId(lessons[0]._id);
    } catch (err) {
      if (err.response?.status === 404 && err.response?.data?.message?.includes("not enrolled")) {
        // Not enrolled — send them to the course page to enroll first.
        navigate(`/courses/${id}`);
        return;
      }
      setError(err.response?.data?.message || "Failed to load this course.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const completedSet = useMemo(
    () => new Set((enrollment?.completedLessons || []).map(String)),
    [enrollment]
  );

  const activeLesson = course?.lessons.find((l) => l._id === activeLessonId);

  const progressPercent =
    course && course.lessons.length > 0
      ? Math.round((completedSet.size / course.lessons.length) * 100)
      : 0;

  const handleToggle = async (lessonId) => {
    setToggling(true);
    try {
      const res = await api.put(
        `/enrollments/${id}/lessons/${lessonId}/toggle`
      );
      setEnrollment(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update progress.");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="center">
        <div className="spinner" />
        <p className="muted">Loading lessons...</p>
      </div>
    );
  }

  if (error && !course) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="page">
      <Link to={`/courses/${id}`} className="back-link">
        ← Back to course
      </Link>

      <div className="page-header">
        <div>
          <div className="page-kicker">{course.title}</div>
          <h1 className="page-title">Learning path</h1>
        </div>

        <div className="learn-progress-chip">
          {progressPercent === 100 ? (
            <>
              <Award size={16} /> Course complete!
            </>
          ) : (
            <>{progressPercent}% complete</>
          )}
        </div>
      </div>

      <div className="learn-progress-track">
        <div
          className="learn-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {course.lessons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>No lessons published yet</h3>
          <p className="muted">
            The instructor hasn't added any lecture videos to this course yet.
          </p>
        </div>
      ) : (
        <div className="learn-layout">
          <div className="learn-player">
            {activeLesson ? (
              <>
                <div className="learn-video-frame">
                  <iframe
                    key={activeLesson._id}
                    src={`https://www.youtube.com/embed/${activeLesson.youtubeVideoId}`}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className="learn-video-meta">
                  <h2>{activeLesson.title}</h2>
                  {activeLesson.description && <p>{activeLesson.description}</p>}

                  <button
                    className={
                      completedSet.has(activeLesson._id)
                        ? "btn-secondary"
                        : "btn-primary"
                    }
                    disabled={toggling}
                    onClick={() => handleToggle(activeLesson._id)}
                  >
                    {completedSet.has(activeLesson._id) ? (
                      <>
                        <CheckCircle2 size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
                        Marked complete
                      </>
                    ) : (
                      "Mark as complete"
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p className="muted">Select a lesson to start watching.</p>
              </div>
            )}
          </div>

          <ol className="learn-lesson-list">
            {course.lessons.map((lesson, i) => {
              const done = completedSet.has(lesson._id);
              const active = lesson._id === activeLessonId;

              return (
                <li key={lesson._id}>
                  <button
                    type="button"
                    className={`learn-lesson-item ${active ? "active" : ""}`}
                    onClick={() => setActiveLessonId(lesson._id)}
                  >
                    <span className="learn-lesson-check">
                      {done ? (
                        <CheckCircle2 size={18} className="check-done" />
                      ) : (
                        <Circle size={18} className="check-todo" />
                      )}
                    </span>

                    <img
                      src={`https://img.youtube.com/vi/${lesson.youtubeVideoId}/hqdefault.jpg`}
                      alt=""
                      className="learn-lesson-thumb"
                    />

                    <span className="learn-lesson-info">
                      <strong>
                        {i + 1}. {lesson.title}
                      </strong>
                    </span>

                    {active && <PlayCircle size={16} className="learn-lesson-playing" />}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}