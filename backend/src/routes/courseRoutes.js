const express = require("express");
const {
  createCourse,
  getCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  deleteCourse,
  getEnrolledStudents,
  addLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Every route below requires a logged-in user.
router.use(protect);

router.route("/")
  .get(getCourses)                                   // any logged-in user can browse
  .post(authorize("instructor"), createCourse);       // only instructors can create

router.get("/mine/list", authorize("instructor"), getMyCourses);

router.route("/:id")
  .get(getCourseById)
  .put(authorize("instructor"), updateCourse)
  .delete(authorize("instructor"), deleteCourse);

router.get("/:id/students", authorize("instructor"), getEnrolledStudents);

// Lecture materials (YouTube lessons) — instructor manages, owner only.
router.post("/:id/lessons", authorize("instructor"), addLesson);
router.put("/:id/lessons/:lessonId", authorize("instructor"), updateLesson);
router.delete("/:id/lessons/:lessonId", authorize("instructor"), deleteLesson);

module.exports = router;