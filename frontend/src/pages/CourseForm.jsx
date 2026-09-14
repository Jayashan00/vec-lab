import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

// A single form component handles BOTH creating and editing a course.
// When a course "id" is present in the URL we're editing; otherwise creating.
export default function CourseForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", description: "", content: "", category: "" });
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;
    api
      .get(`/courses/${id}`)
      .then((res) => {
        const { title, description, content, category } = res.data.data;
        setForm({ title, description, content, category });
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load course"))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      setError(err.response?.data?.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="muted center">Loading course...</p>;

  return (
    <div className="auth-form-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isEditMode ? "Edit Course" : "Create a New Course"}</h2>
        {error && <div className="alert alert-error">{error}</div>}

        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Category</label>
        <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Web Development" />

        <label>Description</label>
        <textarea name="description" rows={3} value={form.description} onChange={handleChange} required />

        <label>Content</label>
        <textarea name="content" rows={5} value={form.content} onChange={handleChange} required
          placeholder="Outline modules/lessons covered in this course" />

        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditMode ? "Update Course" : "Create Course"}
        </button>
      </form>
    </div>
  );
}
