require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const gptRoutes = require("./routes/gptRoutes");

connectDB();

const app = express();

// --- Global middleware ---
app.use(helmet()); // sets safe HTTP headers
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "10kb" }));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev")); // request logging in development
}

// --- Health check (useful for cloud host uptime checks) ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// --- Feature routes ---
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/gpt", gptRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
