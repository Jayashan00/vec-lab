const mongoose = require("mongoose");

// Join table between a student and a course.
// A compound unique index stops a student enrolling twice in the same course.
const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    // IDs of the lesson subdocuments (within the course) this student has
    // marked as watched/complete. Stored here rather than on the Course
    // itself since completion is per-student, not per-course.
    completedLessons: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);