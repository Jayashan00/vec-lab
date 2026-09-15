import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
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
      const data = await login(form);

      navigate(
        data.role === "instructor"
          ? "/instructor/dashboard"
          : "/courses"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please check your details."
      );
    }
  };

  return (
    <div className="page auth-layout">
      <div className="auth-card">
        <div className="auth-icon">↗</div>

        <h2>Welcome back</h2>

        <p className="muted">
          Sign in to continue your learning journey.
        </p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-label">Email address</label>

          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label className="form-label">Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing you in..." : "Sign In →"}
          </button>
        </form>

        <div className="auth-footer">
          <span className="muted">
            Don't have an account?{" "}
          </span>

          <Link to="/register">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}