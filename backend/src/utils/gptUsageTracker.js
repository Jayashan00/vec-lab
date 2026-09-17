const fs = require("fs");
const path = require("path");

// The assessment limits us to a fixed number of GPT API calls.
// This tracker persists the running count to a small JSON file so the
// count survives server restarts, and exposes helpers to check/increment it.
const USAGE_FILE = path.join(__dirname, "..", "data", "gpt-usage.json");

const readUsage = () => {
  try {
    const raw = fs.readFileSync(USAGE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    // File doesn't exist yet on first run - start from zero.
    return { requestCount: 0, history: [] };
  }
};

const writeUsage = (usage) => {
  // Create the data/ folder if it doesn't exist yet (e.g. a fresh clone on
  // a new server, since generated runtime data isn't committed to git).
  fs.mkdirSync(path.dirname(USAGE_FILE), { recursive: true });
  fs.writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2));
};

const getRequestCount = () => readUsage().requestCount;

const getMaxRequests = () => Number(process.env.GPT_MAX_REQUESTS || 250);

const hasReachedLimit = () => getRequestCount() >= getMaxRequests();

// Records one successful GPT call along with a short log entry (prompt +
// timestamp). Keeping this out of any loop is what the assessment asks for -
// it is called exactly once per user-triggered recommendation request.
const recordRequest = (prompt) => {
  const usage = readUsage();
  usage.requestCount += 1;
  usage.history.push({
    prompt: prompt.slice(0, 200),
    timestamp: new Date().toISOString(),
  });
  writeUsage(usage);
  return usage.requestCount;
};

module.exports = {
  getRequestCount,
  getMaxRequests,
  hasReachedLimit,
  recordRequest,
};