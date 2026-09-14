const express = require("express");
const rateLimit = require("express-rate-limit");
const { getRecommendations } = require("../controllers/gptController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Extra safety net on top of the persisted usage counter: stops a single
// user from hammering the endpoint and burning through the 250 call budget.
const gptLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many recommendation requests. Please wait a moment." },
});

router.post("/recommend", protect, authorize("student"), gptLimiter, getRecommendations);

module.exports = router;
