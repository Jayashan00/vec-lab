import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await register(form);

      navigate(
        data.role === "instructor"
          ? "/instructor/dashboard"
          : "/courses"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account."
      );
    }
  };

  return (
    <div className="page auth-layout">
      <div className="auth-card">
        <div className="auth-icon">+</div>

        <h2>Create your account</h2>

        <p className="muted">
          Join LearnHub and start building your future.
        </p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Username
          </label>

          <input
            name="username"
            placeholder="Your name"
            value={form.username}
            onChange={handleChange}
            required
            minLength={3}
          />

          <label className="form-label">
            Email address
          </label>

          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label className="form-label">
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          <label className="form-label">
            I want to join as
          </label>

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="student">
              Student — learn and grow
            </option>

            <option value="instructor">
              Instructor — teach and share
            </option>
          </select>

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account →"}
          </button>
        </form>

        <div className="auth-footer">
          <span className="muted">
            Already have an account?{" "}
          </span>

          <Link to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}