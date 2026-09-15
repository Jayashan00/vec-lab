import {
  Code2, Database, Palette, Briefcase, Cloud, ShieldHalf,
  BrainCircuit, LineChart, Smartphone, Server, Globe, BookOpen,
} from "lucide-react";

// Maps a free-text course category (instructors can type anything) to a
// representative icon. Falls back to a generic book icon when nothing
// matches, so this never breaks on an unexpected category string.
const ICON_RULES = [
  { match: /ai|machine learning|artificial intelligence|deep learning/i, icon: BrainCircuit },
  { match: /data|analytics/i, icon: Database },
  { match: /cloud|aws|azure|devops/i, icon: Cloud },
  { match: /security|cyber/i, icon: ShieldHalf },
  { match: /design|ux|ui/i, icon: Palette },
  { match: /business|product|management/i, icon: Briefcase },
  { match: /mobile|android|ios|flutter/i, icon: Smartphone },
  { match: /backend|server|database admin/i, icon: Server },
  { match: /marketing|growth|finance/i, icon: LineChart },
  { match: /web|frontend|javascript|react|software/i, icon: Code2 },
  { match: /language|writing|general/i, icon: Globe },
];

function iconForCategory(category = "") {
  const found = ICON_RULES.find((rule) => rule.match.test(category));
  return found ? found.icon : BookOpen;
}

export default function CourseCard({ course, footer }) {
  if (!course) {
    return null;
  }

  const Icon = iconForCategory(course.category);

  return (
    <article className="card">
      <div className="card-icon">
        <Icon size={20} />
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