const asyncHandler = require("express-async-handler");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// @desc    Enroll the logged-in student in a course
// @route   POST /api/enrollments/:courseId
// @access  Private (student only)
const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const alreadyEnrolled = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
  });

  if (alreadyEnrolled) {
    res.status(400);
    throw new Error("You are already enrolled in this course");
  }

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: course._id,
  });

  course.enrollmentCount += 1;
  await course.save();

  res.status(201).json({
    success: true,
    message: "Enrollment completed successfully",
    data: enrollment,
  });
});

// @desc    Get all courses the logged-in student is enrolled in
// @route   GET /api/enrollments/my
// @access  Private (student only)
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: "course",
      populate: { path: "instructor", select: "username email" },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments,
  });
});

// @desc    Get the logged-in student's enrollment for one specific course
//          (used by the lesson player to know what's already completed)
// @route   GET /api/enrollments/course/:courseId
// @access  Private (student only)
const getEnrollmentForCourse = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(404);
    throw new Error("You are not enrolled in this course");
  }

  res.status(200).json({ success: true, data: enrollment });
});

// @desc    Mark a lesson complete/incomplete for the logged-in student
// @route   PUT /api/enrollments/:courseId/lessons/:lessonId/toggle
// @access  Private (student only)
const toggleLessonComplete = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const lessonExists = course.lessons.id(req.params.lessonId);
  if (!lessonExists) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error("You must be enrolled in this course to track progress");
  }

  const lessonId = req.params.lessonId;
  const alreadyDone = enrollment.completedLessons.some(
    (id) => id.toString() === lessonId
  );

  if (alreadyDone) {
    enrollment.completedLessons = enrollment.completedLessons.filter(
      (id) => id.toString() !== lessonId
    );
  } else {
    enrollment.completedLessons.push(lessonId);
  }

  // Auto-flip status to "completed" once every lesson is checked off, and
  // back to "active" if the student unchecks one after finishing.
  const totalLessons = course.lessons.length;
  enrollment.status =
    totalLessons > 0 && enrollment.completedLessons.length >= totalLessons
      ? "completed"
      : "active";

  await enrollment.save();

  res.status(200).json({ success: true, data: enrollment });
});

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentForCourse,
  toggleLessonComplete,
};