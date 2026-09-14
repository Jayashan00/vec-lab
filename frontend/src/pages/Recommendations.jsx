import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Recommendations() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResults(null);
    setLoading(true);
    try {
      const res = await api.post("/gpt/recommend", { prompt });
      setResults(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not fetch recommendations right now");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Ask GPT for Course Recommendations</h2>
      <p className="muted">
        Tell us your goal, e.g. "I want to be a software engineer, what
        courses should I follow?" and we'll suggest relevant courses from our
        catalog.
      </p>

      <form className="prompt-form" onSubmit={handleSubmit}>
        <textarea
          rows={3}
          placeholder="Describe your learning goal..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Get Recommendations"}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {results && results.length > 0 && (
        <div className="grid">
          {results.map((rec, idx) => (
            <div className="card" key={idx}>
              <h3>{rec.title}</h3>
              <p className="muted">{rec.reason}</p>
              {rec.courseId ? (
                <Link to={`/courses/${rec.courseId}`} className="btn-secondary small">
                  View Course
                </Link>
              ) : (
                <span className="muted">Course not currently in catalog</span>
              )}
            </div>
          ))}
        </div>
      )}

      {results && results.length === 0 && (
        <p className="muted">No matching recommendations were found. Try rephrasing your goal.</p>
      )}
    </div>
  );
}
