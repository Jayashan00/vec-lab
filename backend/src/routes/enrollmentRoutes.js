const express = require("express");
const { enrollInCourse, getMyEnrollments } = require("../controllers/enrollmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("student"));

router.post("/:courseId", enrollInCourse);
router.get("/my", getMyEnrollments);

module.exports = router;
