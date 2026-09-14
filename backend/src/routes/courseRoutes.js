const express = require("express");
const {
  createCourse,
  getCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  deleteCourse,
  getEnrolledStudents,
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

module.exports = router;
