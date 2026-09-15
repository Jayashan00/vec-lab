import { useState } from "react";
import { Link } from "react-router-dom";
import { motion as m, AnimatePresence as AP } from "framer-motion";
import api from "../api/axios";
import AnimatedBot from "../components/AnimatedBot";

const prompts = [
  "I want to become a software engineer.",
  "I want to learn web development.",
  "I want to start a career in data science.",
];

export default function Recommendations() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setError("");
    setResults(null);
    setLoading(true);

    try {
      const res = await api.post("/gpt/recommend", { prompt });
      setResults(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not fetch recommendations right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const usePrompt = (value) => setPrompt(value);

  // Drive the mascot's animation purely from existing state — no extra logic.
  const botState = loading ? "thinking" : results?.length ? "happy" : "idle";
  const botStatusText = loading
    ? "Thinking…"
    : results?.length
    ? "Got matches!"
    : "Ready to help";

  return (
    <div className="page">
      <div className="ai-shell">
        <div className="ai-header">
          <div className="ai-spark">✦ AI-powered learning advisor</div>
          <h1>Tell us where you want to go.</h1>
          <p>
            Describe your career goal or what you want to learn. Our AI
            advisor will find relevant courses from the LearnHub catalog.
          </p>
        </div>

        <div className="ai-body">
          <div className="chat-layout">
            <div className="chat-bot-panel">
              <AnimatedBot state={botState} size={140} />
              <span className="chat-bot-status">{botStatusText}</span>
            </div>

            <div>
              {loading && (
                <div className="chat-bubble">
                  <span className="typing-dots">
                    <span /><span /><span />
                  </span>{" "}
                  Reading through the LearnHub catalog for a good match…
                </div>
              )}

              <form className="prompt-form" onSubmit={handleSubmit}>
                <textarea
                  rows={5}
                  placeholder="Example: I want to become a full-stack software engineer. What should I learn first?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                />

                <div className="prompt-hints">
                  {prompts.map((item) => (
                    <button
                      type="button"
                      className="prompt-hint"
                      key={item}
                      onClick={() => usePrompt(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "✦ Finding your best matches..." : "✦ Get My Recommendations"}
                </button>
              </form>

              {error && <div className="alert alert-error">{error}</div>}

              <AP mode="wait">
                {results && results.length > 0 && (
                  <m.div
                    key="results"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{ marginTop: "35px" }}
                  >
                    <div className="page-header">
                      <div>
                        <div className="page-kicker">Personalized for you</div>
                        <h2 className="page-title">Recommended courses</h2>
                      </div>
                    </div>

                    <div className="grid">
                      {results.map((rec, idx) => (
                        <m.article
                          className="card recommendation-card"
                          key={idx}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: idx * 0.08 }}
                        >
                          <div className="recommendation-number">{idx + 1}</div>
                          <h3>{rec.title}</h3>
                          <p className="muted card-description">{rec.reason}</p>
                          <div className="card-footer">
                            {rec.courseId ? (
                              <Link
                                to={`/courses/${rec.courseId}`}
                                className="btn-secondary small"
                              >
                                Explore Course →
                              </Link>
                            ) : (
                              <span className="muted">
                                Course not currently in catalog
                              </span>
                            )}
                          </div>
                        </m.article>
                      ))}
                    </div>
                  </m.div>
                )}

                {results && results.length === 0 && (
                  <m.div
                    key="empty"
                    className="empty-state"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: "25px" }}
                  >
                    <div className="empty-icon">✦</div>
                    <h3>No matching courses found</h3>
                    <p className="muted">
                      Try describing your goal with a little more detail.
                    </p>
                  </m.div>
                )}
              </AP>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}