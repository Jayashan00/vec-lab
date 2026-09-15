import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Code2, Database, Palette, Briefcase,
  ShieldCheck, LineChart, Sparkles, Quote, GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// Real, verified Pexels photos (free license, no attribution required) —
// picked to actually match each subject instead of random stock imagery.
// Swap these URLs any time for your own photography.
const categories = [
  {
    title: "Software Engineering",
    tag: "42 courses",
    icon: Code2,
    photo: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    title: "Data Science & AI",
    tag: "27 courses",
    icon: Database,
    photo: "https://images.pexels.com/photos/37685036/pexels-photo-37685036.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    title: "Design & UX",
    tag: "18 courses",
    icon: Palette,
    photo: "https://images.pexels.com/photos/36747234/pexels-photo-36747234.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    title: "Business & Product",
    tag: "15 courses",
    icon: Briefcase,
    photo: "https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
];

// The hero panel cross-fades through the same four categories with a slow
// Ken-Burns zoom — real "moving images" instead of a static graphic.
const showcaseSlides = categories.map((c) => ({
  photo: c.photo,
  title: c.title,
  subtitle: c.tag + " · updated this week",
}));

// Illustrated, deterministic avatars (DiceBear) — not real photographs,
// since these are placeholder testimonials with fictional names. Swap in
// real learner photos once you have genuine testimonials to publish.
const avatarFor = (name) =>
  `https://api.dicebear.com/10.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=eef2f7`;

const testimonials = [
  {
    name: "Amaya Perera",
    role: "Frontend Developer",
    text: "The AI advisor pointed me straight at the courses I actually needed instead of making me guess. Landed my first dev role two months later.",
  },
  {
    name: "Nadeesha Silva",
    role: "Data Analyst",
    text: "Clean course structure, real instructors, and the enrollment flow just works. No clutter, no confusion.",
  },
  {
    name: "Kasun Fernando",
    role: "Product Manager",
    text: "I described my career goal in plain English and got a shortlist of relevant courses in seconds. Genuinely useful.",
  },
  {
    name: "Ishara Jayasuriya",
    role: "Instructor",
    text: "Managing my courses and seeing enrolled students in one dashboard makes teaching on LearnHub effortless.",
  },
].map((t) => ({ ...t, avatar: avatarFor(t.name) }));

const features = [
  {
    icon: Sparkles,
    title: "AI course advisor",
    text: "Describe your career goal in plain language and get a ranked list of real courses from our catalog — no invented results.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    text: "JWT authentication and server-side role checks protect every instructor and student action, not just the UI.",
  },
  {
    icon: LineChart,
    title: "Track your progress",
    text: "See every course you're enrolled in, its status, and pick up right where you left off.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);

  // Auto-advance the hero showcase every few seconds.
  useEffect(() => {
    const id = setInterval(
      () => setSlideIndex((i) => (i + 1) % showcaseSlides.length),
      4000
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (user?.role !== "student") return;
    let active = true;
    api
      .get("/courses")
      .then((res) => {
        if (active) setTrending((res.data?.data || []).slice(0, 3));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="page">
      {/* ============ HERO ============ */}
      <section className="classic-hero">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div className="classic-eyebrow" variants={fadeUp}>
            <GraduationCap size={15} /> Smarter learning starts here
          </motion.div>

          <motion.h1 variants={fadeUp}>
            Learn with purpose.
            <br />
            <em>Grow with confidence.</em>
          </motion.h1>

          <motion.p className="classic-hero-description" variants={fadeUp}>
            LearnHub connects ambitious learners with practical courses,
            expert instructors, and AI-powered recommendations tailored
            to where you want to go.
          </motion.p>

          {!user && (
            <motion.div className="classic-hero-actions" variants={fadeUp}>
              <Link to="/register" className="btn-primary">Start Learning →</Link>
              <Link to="/login" className="btn-outline-gold">Sign In</Link>
            </motion.div>
          )}

          {user?.role === "student" && (
            <motion.div className="classic-hero-actions" variants={fadeUp}>
              <Link to="/courses" className="btn-primary">Explore Courses →</Link>
              <Link to="/recommendations" className="btn-outline-gold">Ask AI Advisor</Link>
            </motion.div>
          )}

          {user?.role === "instructor" && (
            <motion.div className="classic-hero-actions" variants={fadeUp}>
              <Link to="/instructor/dashboard" className="btn-primary">Open Dashboard →</Link>
              <Link to="/instructor/courses/new" className="btn-outline-gold">Create Course</Link>
            </motion.div>
          )}

          {trending.length > 0 && (
            <motion.div className="classic-trending" variants={fadeUp}>
              {trending.map((course) => (
                <Link to={`/courses/${course._id}`} key={course._id}>
                  <BookOpen size={15} /> {course.title}
                </Link>
              ))}
            </motion.div>
          )}

          <motion.div className="classic-stat-row" variants={fadeUp}>
            <div className="classic-stat">
              <strong>Practical</strong>
              <span>Career-focused learning</span>
            </div>
            <div className="classic-stat">
              <strong>AI-powered</strong>
              <span>Personalized discovery</span>
            </div>
            <div className="classic-stat">
              <strong>Built for growth</strong>
              <span>Learn at your pace</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="classic-hero-panel classic-hero-photo-panel"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {(() => {
              const slide = showcaseSlides[slideIndex];
              return (
                <motion.div
                  key={slideIndex}
                  className="classic-showcase-slide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <motion.img
                    src={slide.photo}
                    alt={slide.title}
                    className="classic-showcase-photo"
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.08 }}
                    transition={{ duration: 3.4, ease: "easeOut" }}
                  />
                  <div className="classic-showcase-overlay" />
                  <div className="classic-showcase-caption">
                    <strong>{slide.title}</strong>
                    <span>{slide.subtitle}</span>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          <div className="classic-showcase-dots">
            {showcaseSlides.map((_, i) => (
              <button
                key={i}
                aria-label={`Show slide ${i + 1}`}
                className={`classic-showcase-dot ${i === slideIndex ? "active" : ""}`}
                onClick={() => setSlideIndex(i)}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ============ FEATURES ============ */}
      <motion.section
        className="section-block"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-heading">
          <span className="section-kicker">WHY LEARNHUB</span>
          <h2>Everything you need to move forward</h2>
          <p>A platform built around real career outcomes, not just video playback.</p>
        </div>

        <div className="classic-feature-list">
          {features.map((f, i) => (
            <div className="classic-feature" key={f.title}>
              <div className="classic-feature-index">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ============ CATEGORIES ============ */}
      <motion.section
        className="section-block"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-heading">
          <span className="section-kicker">EXPLORE</span>
          <h2>Popular categories</h2>
          <p>Jump into the areas learners are focusing on right now.</p>
        </div>

        <div className="classic-category-grid">
          {categories.map((cat, i) => (
            <motion.div
              className="classic-category-tile"
              key={cat.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <div className="classic-category-photo-wrap">
                <img src={cat.photo} alt={cat.title} loading="lazy" />
              </div>
              <div className="classic-category-body">
                <div className="classic-category-icon">
                  <cat.icon size={20} />
                </div>
                <h3>{cat.title}</h3>
                <span>{cat.tag}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ============ TESTIMONIALS ============ */}
      <motion.section
        className="section-block"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-heading">
          <span className="section-kicker">LEARNER STORIES</span>
          <h2>People are getting real results</h2>
          <p>A few voices from the LearnHub community.</p>
        </div>

        <div className="classic-quote-grid">
          {testimonials.map((t, i) => (
            <motion.div
              className="classic-quote-card"
              key={t.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              whileHover={{ y: -4 }}
            >
              <Quote className="classic-quote-mark" size={26} />
              <p>{t.text}</p>
              <div className="classic-quote-person">
                <img className="classic-quote-avatar" src={t.avatar} alt="" loading="lazy" />
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ============ CTA ============ */}
      {!user && (
        <motion.section
          className="cta-classic"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Ready to find your next course?</h2>
          <p>Create a free account and let the AI advisor map out where to start.</p>
          <Link to="/register" className="btn-primary">Create Free Account →</Link>
        </motion.section>
      )}
    </div>
  );
}