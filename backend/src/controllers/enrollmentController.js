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

module.exports = { enrollInCourse, getMyEnrollments };
