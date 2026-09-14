// Optional helper: populates the database with a demo instructor and a
// handful of courses so the app / GPT recommendations have real data to
// work with right after cloning. Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Course = require("../models/Course");

const demoCourses = [
  {
    title: "Introduction to JavaScript",
    description: "Learn the fundamentals of JavaScript: variables, functions, loops and DOM basics.",
    content: "Module 1: Syntax basics. Module 2: Functions & scope. Module 3: DOM manipulation.",
    category: "Web Development",
  },
  {
    title: "Full-Stack Web Development with MERN",
    description: "Build complete web applications using MongoDB, Express, React and Node.js.",
    content: "Module 1: REST APIs. Module 2: React fundamentals. Module 3: Auth & deployment.",
    category: "Web Development",
  },
  {
    title: "Data Structures and Algorithms",
    description: "Master arrays, linked lists, trees, graphs and common algorithmic patterns.",
    content: "Module 1: Complexity analysis. Module 2: Trees & graphs. Module 3: Dynamic programming.",
    category: "Computer Science",
  },
  {
    title: "Python for Data Science",
    description: "Use Python, pandas and numpy to clean, analyze and visualize real-world datasets.",
    content: "Module 1: Python basics. Module 2: pandas. Module 3: Data visualization.",
    category: "Data Science",
  },
  {
    title: "Machine Learning Fundamentals",
    description: "Understand supervised and unsupervised learning and build your first ML models.",
    content: "Module 1: Regression. Module 2: Classification. Module 3: Model evaluation.",
    category: "Artificial Intelligence",
  },
  {
    title: "Cloud Computing with AWS",
    description: "Learn to deploy and scale applications on AWS using EC2, S3 and RDS.",
    content: "Module 1: EC2 & S3. Module 2: RDS. Module 3: CI/CD deployment.",
    category: "Cloud Computing",
  },
];

const seed = async () => {
  await connectDB();

  let instructor = await User.findOne({ email: "instructor@demo.com" });
  if (!instructor) {
    instructor = await User.create({
      username: "demo_instructor",
      email: "instructor@demo.com",
      password: "password123",
      role: "instructor",
    });
    console.log("Created demo instructor: instructor@demo.com / password123");
  }

  for (const courseData of demoCourses) {
    const exists = await Course.findOne({ title: courseData.title });
    if (!exists) {
      await Course.create({ ...courseData, instructor: instructor._id });
      console.log(`Seeded course: ${courseData.title}`);
    }
  }

  console.log("Seeding complete.");
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
