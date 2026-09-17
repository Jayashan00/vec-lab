const asyncHandler = require("express-async-handler");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { extractYoutubeId } = require("../utils/youtube");

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (instructor only)
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, content, category } = req.body;

  if (!title || !description || !content) {
    res.status(400);
    throw new Error("Title, description and content are required");
  }

  const course = await Course.create({
    title,
    description,
    content,
    category,
    instructor: req.user._id,
  });

  res.status(201).json({ success: true, data: course });
});

// @desc    Get all courses (available for browsing by any logged-in user)
// @route   GET /api/courses
// @access  Private
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate("instructor", "username email")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: courses.length, data: courses });
});

// @desc    Get a single course by id
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate(
    "instructor",
    "username email"
  );

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  res.status(200).json({ success: true, data: course });
});

// @desc    Get courses created by the logged-in instructor
// @route   GET /api/courses/mine/list
// @access  Private (instructor only)
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({ success: true, count: courses.length, data: courses });
});

// @desc    Update a course (only its own creator can edit it)
// @route   PUT /api/courses/:id
// @access  Private (instructor only, owner)
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only edit courses you created");
  }

  const { title, description, content, category } = req.body;
  course.title = title ?? course.title;
  course.description = description ?? course.description;
  course.content = content ?? course.content;
  course.category = category ?? course.category;

  const updated = await course.save();
  res.status(200).json({ success: true, data: updated });
});

// @desc    Delete a course (only its own creator can delete it)
// @route   DELETE /api/courses/:id
// @access  Private (instructor only, owner)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only delete courses you created");
  }

  await Enrollment.deleteMany({ course: course._id }); // clean up related enrollments
  await course.deleteOne();

  res.status(200).json({ success: true, message: "Course deleted successfully" });
});

// @desc    Get the list of students enrolled in a specific course (table view)
// @route   GET /api/courses/:id/students
// @access  Private (instructor only, owner)
const getEnrolledStudents = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only view students for your own courses");
  }

  const enrollments = await Enrollment.find({ course: course._id })
    .populate("student", "username email createdAt")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
});

// @desc    Add a lecture (YouTube link) to a course
// @route   POST /api/courses/:id/lessons
// @access  Private (instructor only, owner)
const addLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only add lessons to courses you created");
  }

  const { title, description, youtubeUrl } = req.body;

  if (!title || !youtubeUrl) {
    res.status(400);
    throw new Error("Lesson title and YouTube URL are required");
  }

  const youtubeVideoId = extractYoutubeId(youtubeUrl);
  if (!youtubeVideoId) {
    res.status(400);
    throw new Error("That doesn't look like a valid YouTube URL");
  }

  course.lessons.push({
    title,
    description,
    youtubeUrl,
    youtubeVideoId,
    order: course.lessons.length,
  });

  await course.save();

  res.status(201).json({ success: true, data: course });
});

// @desc    Update a lesson's details
// @route   PUT /api/courses/:id/lessons/:lessonId
// @access  Private (instructor only, owner)
const updateLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only edit lessons on courses you created");
  }

  const lesson = course.lessons.id(req.params.lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  const { title, description, youtubeUrl } = req.body;

  if (youtubeUrl && youtubeUrl !== lesson.youtubeUrl) {
    const youtubeVideoId = extractYoutubeId(youtubeUrl);
    if (!youtubeVideoId) {
      res.status(400);
      throw new Error("That doesn't look like a valid YouTube URL");
    }
    lesson.youtubeUrl = youtubeUrl;
    lesson.youtubeVideoId = youtubeVideoId;
  }

  lesson.title = title ?? lesson.title;
  lesson.description = description ?? lesson.description;

  await course.save();

  res.status(200).json({ success: true, data: course });
});

// @desc    Delete a lesson from a course
// @route   DELETE /api/courses/:id/lessons/:lessonId
// @access  Private (instructor only, owner)
const deleteLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only delete lessons on courses you created");
  }

  const lesson = course.lessons.id(req.params.lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  lesson.deleteOne();
  await course.save();

  // Clean up: also remove this lesson's id from every student's completed
  // list so progress percentages don't silently include a deleted lesson.
  await Enrollment.updateMany(
    { course: course._id },
    { $pull: { completedLessons: req.params.lessonId } }
  );

  res.status(200).json({ success: true, data: course });
});

module.exports = {
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
};