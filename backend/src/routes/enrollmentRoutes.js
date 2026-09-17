const express = require("express");
const {
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentForCourse,
  toggleLessonComplete,
} = require("../controllers/enrollmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("student"));

router.post("/:courseId", enrollInCourse);
router.get("/my", getMyEnrollments);
router.get("/course/:courseId", getEnrollmentForCourse);
router.put("/:courseId/lessons/:lessonId/toggle", toggleLessonComplete);

module.exports = router;