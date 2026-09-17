import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import CourseLearn from "./pages/CourseLearn";
import MyEnrollments from "./pages/MyEnrollments";
import Recommendations from "./pages/Recommendations";
import InstructorDashboard from "./pages/InstructorDashboard";
import CourseForm from "./pages/CourseForm";
import ManageLessons from "./pages/ManageLessons";
import CourseStudents from "./pages/CourseStudents";
import NotFound from "./pages/NotFound";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export default function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <main className="container">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student-only routes */}
              <Route path="/courses" element={
                <ProtectedRoute role="student"><CourseList /></ProtectedRoute>
              } />
              <Route path="/courses/:id" element={
                <ProtectedRoute role="student"><CourseDetail /></ProtectedRoute>
              } />
              <Route path="/courses/:id/learn" element={
                <ProtectedRoute role="student"><CourseLearn /></ProtectedRoute>
              } />
              <Route path="/my-enrollments" element={
                <ProtectedRoute role="student"><MyEnrollments /></ProtectedRoute>
              } />
              <Route path="/recommendations" element={
                <ProtectedRoute role="student"><Recommendations /></ProtectedRoute>
              } />

              {/* Instructor-only routes */}
              <Route path="/instructor/dashboard" element={
                <ProtectedRoute role="instructor"><InstructorDashboard /></ProtectedRoute>
              } />
              <Route path="/instructor/courses/new" element={
                <ProtectedRoute role="instructor"><CourseForm /></ProtectedRoute>
              } />
              <Route path="/instructor/courses/:id/edit" element={
                <ProtectedRoute role="instructor"><CourseForm /></ProtectedRoute>
              } />
              <Route path="/instructor/courses/:id/lessons" element={
                <ProtectedRoute role="instructor"><ManageLessons /></ProtectedRoute>
              } />
              <Route path="/instructor/courses/:id/students" element={
                <ProtectedRoute role="instructor"><CourseStudents /></ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}