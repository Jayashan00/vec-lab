import { motion } from "framer-motion";

/**
 * AnimatedBot
 * A self-contained, dependency-free (besides framer-motion) animated AI
 * mascot. No external embeds/iframes — fully theme-able via CSS variables
 * so it always matches the LearnHub palette, renders instantly, and has
 * no third-party watermark to fight with.
 *
 * Props:
 *  - state: "idle" | "thinking" | "talking" | "happy"   (default "idle")
 *  - size:  pixel size of the bot (default 180)
 */
export default function AnimatedBot({ state = "idle", size = 180 }) {
  const isThinking = state === "thinking";
  const isTalking = state === "talking";
  const isHappy = state === "happy";

  return (
    <div
      className={`bot-wrap bot-${state}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient glow behind the bot */}
      <motion.div
        className="bot-glow"
        animate={{
          scale: isThinking ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: isThinking ? [0.55, 0.9, 0.55] : [0.45, 0.65, 0.45],
        }}
        transition={{
          duration: isThinking ? 1.4 : 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orbiting "thinking" particles */}
      {isThinking && (
        <motion.div
          className="bot-orbit"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        >
          <span className="bot-orbit-dot dot-1" />
          <span className="bot-orbit-dot dot-2" />
          <span className="bot-orbit-dot dot-3" />
        </motion.div>
      )}

      {/* The bot body, floating up and down */}
      <motion.div
        className="bot-float"
        animate={{ y: [0, -10, 0], rotate: isHappy ? [0, -3, 3, 0] : 0 }}
        transition={{
          y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 0.6, repeat: isHappy ? Infinity : 0, repeatDelay: 1.2 },
        }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <defs>
            <linearGradient id="botBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>

          {/* antenna */}
          <motion.line
            x1="100" y1="34" x2="100" y2="16"
            stroke="url(#botBody)" strokeWidth="4" strokeLinecap="round"
          />
          <motion.circle
            cx="100" cy="12" r="7" fill="url(#botBody)"
            animate={{
              scale: isThinking ? [1, 1.35, 1] : [1, 1.1, 1],
              opacity: [1, 0.75, 1],
            }}
            transition={{ duration: isThinking ? 0.8 : 2, repeat: Infinity }}
          />

          {/* head */}
          <rect
            x="34" y="34" width="132" height="112" rx="34"
            fill="url(#botBody)"
          />

          {/* face panel */}
          <rect x="52" y="58" width="96" height="64" rx="24" fill="rgba(255,255,255,0.14)" />

          {/* eyes */}
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 3.4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
            style={{ originX: "0.5px", originY: "0.5px" }}
          >
            <circle cx="80" cy="90" r="9" fill="white" />
            <circle cx="120" cy="90" r="9" fill="white" />
          </motion.g>

          {/* pupils - look around while thinking */}
          <motion.g
            animate={
              isThinking
                ? { x: [0, 3, -3, 0], y: [0, -2, 2, 0] }
                : { x: 0, y: 0 }
            }
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            <circle cx="80" cy="90" r="3.4" fill="var(--primary-dark)" />
            <circle cx="120" cy="90" r="3.4" fill="var(--primary-dark)" />
          </motion.g>

          {/* mouth: idle = flat, thinking = dots, talking = animated bar, happy = smile */}
          {state === "happy" ? (
            <path
              d="M84 108 Q100 122 116 108"
              stroke="white" strokeWidth="5" strokeLinecap="round" fill="none"
            />
          ) : state === "thinking" ? (
            <g fill="white">
              <motion.circle cx="90" cy="108" r="3" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
              <motion.circle cx="100" cy="108" r="3" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
              <motion.circle cx="110" cy="108" r="3" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
            </g>
          ) : (
            <motion.rect
              x="88" y="105" width="24" height="6" rx="3" fill="white"
              animate={
                isTalking
                  ? { scaleY: [1, 2.2, 0.6, 1.8, 1], scaleX: [1, 0.85, 1, 0.9, 1] }
                  : { scaleY: 1 }
              }
              transition={{ duration: 0.5, repeat: isTalking ? Infinity : 0 }}
              style={{ originX: "0.5px", originY: "0.5px" }}
            />
          )}

          {/* ears / side nodes */}
          <motion.rect
            x="20" y="80" width="12" height="30" rx="6" fill="url(#botBody)"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.rect
            x="168" y="80" width="12" height="30" rx="6" fill="url(#botBody)"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* body */}
          <rect x="60" y="150" width="80" height="34" rx="14" fill="url(#botBody)" opacity="0.9" />
          <motion.circle
            cx="100" cy="167" r="5" fill="white"
            animate={{ opacity: isTalking ? [0.4, 1, 0.4] : 0.8 }}
            transition={{ duration: 0.8, repeat: isTalking ? Infinity : 0 }}
          />
        </svg>
      </motion.div>

      {/* soft contact shadow */}
      <motion.div
        className="bot-shadow"
        animate={{ scaleX: [1, 0.82, 1], opacity: [0.35, 0.2, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}