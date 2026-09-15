import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function CourseForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;

    api
      .get(`/courses/${id}`)
      .then((res) => {
        const {
          title,
          description,
          content,
          category,
        } = res.data.data;

        setForm({
          title,
          description,
          content,
          category,
        });
      })
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            "Failed to load course."
        )
      )
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      if (isEditMode) {
        await api.put(`/courses/${id}`, form);
      } else {
        await api.post("/courses", form);
      }

      navigate("/instructor/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save course."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page form-shell">
      <Link
        to="/instructor/dashboard"
        className="back-link"
      >
        ← Back to dashboard
      </Link>

      <div className="page-header">
        <div>
          <div className="page-kicker">
            Instructor workspace
          </div>

          <h1 className="page-title">
            {isEditMode
              ? "Edit course"
              : "Create a course"}
          </h1>

          <p className="page-subtitle">
            {isEditMode
              ? "Keep your course information up to date."
              : "Share your knowledge with learners on LearnHub."}
          </p>
        </div>
      </div>

      <form
        className="course-form"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="form-row">
          <div className="form-field">
            <label>Course title</label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Full Stack Web Development"
              required
            />
          </div>

          <div className="form-field">
            <label>Category</label>

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Web Development"
            />
          </div>
        </div>

        <div className="form-field">
          <label>Course description</label>

          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="What will students learn from this course?"
            required
          />
        </div>

        <div className="form-field">
          <label>Course content</label>

          <textarea
            name="content"
            rows={9}
            value={form.content}
            onChange={handleChange}
            placeholder="Outline modules, lessons, technologies, or topics covered..."
            required
          />
        </div>

        <div className="form-actions">
          <Link
            to="/instructor/dashboard"
            className="btn-secondary"
          >
            Cancel
          </Link>

          <button
            className="btn-primary"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isEditMode
              ? "Update Course →"
              : "Publish Course →"}
          </button>
        </div>
      </form>
    </div>
  );
}