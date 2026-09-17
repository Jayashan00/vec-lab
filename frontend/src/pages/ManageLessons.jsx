import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Video, Trash2, Pencil, GripVertical, X } from "lucide-react";
import api from "../api/axios";

// Pulls a YouTube video id out of any common URL shape, purely for a live
// thumbnail preview while the instructor is typing — the backend does its
// own authoritative parsing when the form is actually submitted.
function previewYoutubeId(url = "") {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

const emptyForm = { title: "", description: "", youtubeUrl: "" };

export default function ManageLessons() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingLessonId, setEditingLessonId] = useState(null);

  const loadCourse = () => {
    api
      .get(`/courses/${id}`)
      .then((res) => setCourse(res.data.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load course.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingLessonId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (editingLessonId) {
        const res = await api.put(
          `/courses/${id}/lessons/${editingLessonId}`,
          form
        );
        setCourse(res.data.data);
      } else {
        const res = await api.post(`/courses/${id}/lessons`, form);
        setCourse(res.data.data);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLessonId(lesson._id);
    setForm({
      title: lesson.title,
      description: lesson.description || "",
      youtubeUrl: lesson.youtubeUrl,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm("Delete this lesson? This cannot be undone.")) return;

    try {
      const res = await api.delete(`/courses/${id}/lessons/${lessonId}`);
      setCourse(res.data.data);
      if (editingLessonId === lessonId) resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lesson.");
    }
  };

  if (loading) {
    return (
      <div className="center">
        <div className="spinner" />
        <p className="muted">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return <div className="alert alert-error">{error || "Course not found."}</div>;
  }

  const previewId = previewYoutubeId(form.youtubeUrl);

  return (
    <div className="page">
      <Link to="/instructor/dashboard" className="back-link">
        ← Back to dashboard
      </Link>

      <div className="page-header">
        <div>
          <div className="page-kicker">{course.title}</div>
          <h1 className="page-title">Manage lessons</h1>
          <p className="page-subtitle">
            Add YouTube lectures for students to work through in order.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="lesson-manage-layout">
        <form className="lesson-form" onSubmit={handleSubmit}>
          <h3>{editingLessonId ? "Edit lesson" : "Add a lesson"}</h3>

          <div className="form-field">
            <label>Lesson title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Introduction to React Hooks"
              required
            />
          </div>

          <div className="form-field">
            <label>YouTube URL</label>
            <input
              name="youtubeUrl"
              value={form.youtubeUrl}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>

          {previewId && (
            <div className="lesson-thumb-preview">
              <img
                src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`}
                alt="Video thumbnail preview"
              />
              <span>
                <Video size={14} /> Thumbnail preview
              </span>
            </div>
          )}

          <div className="form-field">
            <label>Description (optional)</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="What does this lesson cover?"
            />
          </div>

          <div className="form-actions">
            {editingLessonId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                <X size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                Cancel edit
              </button>
            )}

            <button className="btn-primary" type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingLessonId
                ? "Update Lesson"
                : "Add Lesson →"}
            </button>
          </div>
        </form>

        <div className="lesson-list-panel">
          <h3>
            {course.lessons.length}{" "}
            {course.lessons.length === 1 ? "lesson" : "lessons"} in this course
          </h3>

          {course.lessons.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎬</div>
              <h3>No lessons yet</h3>
              <p className="muted">
                Add your first YouTube lecture using the form.
              </p>
            </div>
          ) : (
            <ol className="lesson-manage-list">
              {course.lessons.map((lesson, i) => (
                <li key={lesson._id} className="lesson-manage-row">
                  <span className="lesson-drag-handle">
                    <GripVertical size={16} />
                  </span>

                  <img
                    src={`https://img.youtube.com/vi/${lesson.youtubeVideoId}/hqdefault.jpg`}
                    alt=""
                    className="lesson-manage-thumb"
                  />

                  <div className="lesson-manage-info">
                    <strong>
                      {i + 1}. {lesson.title}
                    </strong>
                    {lesson.description && (
                      <span>{lesson.description}</span>
                    )}
                  </div>

                  <div className="lesson-manage-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => handleEdit(lesson)}
                      aria-label="Edit lesson"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={() => handleDelete(lesson._id)}
                      aria-label="Delete lesson"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}