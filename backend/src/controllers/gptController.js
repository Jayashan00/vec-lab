const asyncHandler = require("express-async-handler");
const OpenAI = require("openai");
const Course = require("../models/Course");
const { hasReachedLimit, recordRequest, getRequestCount, getMaxRequests } = require("../utils/gptUsageTracker");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// @desc    Get personalized course recommendations from GPT based on a
//          free-text prompt, e.g. "I want to be a software engineer".
// @route   POST /api/gpt/recommend
// @access  Private (student only)
//
// Design note: instead of letting GPT invent course names out of thin air,
// we send it the titles/descriptions of courses that actually exist in our
// database and ask it to pick + rank the most relevant ones. This keeps the
// recommendation grounded in real, enrollable data. Only ONE API call is
// made per request (no loops), matching the assessment's usage guidelines.
const getRecommendations = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim().length < 3) {
    res.status(400);
    throw new Error("Please provide a prompt describing your learning goal");
  }

  // Guard the fixed request budget given for this assessment (250 calls).
  if (hasReachedLimit()) {
    res.status(429);
    throw new Error(
      `GPT API request limit reached (${getMaxRequests()}). Please try again later.`
    );
  }

  const availableCourses = await Course.find().select("title description category").limit(50);

  if (availableCourses.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No courses are available in the catalog yet.",
      data: [],
    });
  }

  const courseCatalog = availableCourses
    .map((c, i) => `${i + 1}. "${c.title}" (${c.category}) - ${c.description}`)
    .join("\n");

  const systemInstruction =
    "You are a helpful academic advisor for an online learning platform. " +
    "You will be given a student's learning goal and a numbered catalog of " +
    "available courses. Recommend only courses that exist in the catalog. " +
    'Respond ONLY with strict JSON in this exact shape: {"recommendations":[{"title":"","reason":""}]}. ' +
    "Include at most 5 recommendations, ordered from most to least relevant.";

  const userMessage = `Student goal: "${prompt}"\n\nCourse catalog:\n${courseCatalog}`;

  // Single, non-looped call to the GPT API.
  const response = await openai.responses.create({
    model: "gpt-5.6-luna",
    input: [
      {
        role: "system",
        content: systemInstruction,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  recordRequest(prompt); // increment the persisted usage counter

  const rawReply = response.output_text || "{}";

  let parsed;
  try {
    parsed = JSON.parse(rawReply);
  } catch (err) {
    // Fall back gracefully if the model ever returns non-JSON text.
    parsed = { recommendations: [], rawText: rawReply };
  }

  // Attach full course details (id, description) to each recommended title
  // so the frontend can link straight to the course page / enroll button.
  const enriched = (parsed.recommendations || []).map((rec) => {
    const match = availableCourses.find(
      (c) => c.title.toLowerCase() === (rec.title || "").toLowerCase()
    );
    return {
      title: rec.title,
      reason: rec.reason,
      courseId: match ? match._id : null,
      description: match ? match.description : null,
    };
  });

  res.status(200).json({
    success: true,
    data: enriched,
    usage: { requestCount: getRequestCount(), maxRequests: getMaxRequests() },
  });
});

module.exports = { getRecommendations };
