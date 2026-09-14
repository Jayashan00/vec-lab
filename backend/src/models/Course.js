const mongoose = require("mongoose");

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
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Course", courseSchema);
