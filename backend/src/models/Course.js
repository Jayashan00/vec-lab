const mongoose = require("mongoose");

// A single lecture item within a course. Kept as an embedded subdocument
// (not its own collection) since lessons are always accessed through their
// parent course and there's no need to query them independently.
const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    youtubeUrl: {
      type: String,
      required: [true, "A YouTube video URL is required"],
      trim: true,
    },
    // Extracted once on save so the frontend never has to re-parse the URL
    // to build a thumbnail or embed link.
    youtubeVideoId: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Course schema as required: title, description, instructor and content.
// "instructor" is a reference to the User who created the course.
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      maxlength: 2000,
    },
    content: {
      type: String,
      required: [true, "Course content is required"],
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Denormalized count kept in sync on enroll/unenroll so the course list
    // can show enrollment numbers without an extra query every time.
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    // Lecture materials for this course, in display order.
    lessons: {
      type: [lessonSchema],
      default: [],
    },
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Course", courseSchema);