import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import MyEnrollments from "./pages/MyEnrollments";
import Recommendations from "./pages/Recommendations";
import InstructorDashboard from "./pages/InstructorDashboard";
import CourseForm from "./pages/CourseForm";
import CourseStudents from "./pages/CourseStudents";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
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
          <Route path="/instructor/courses/:id/students" element={
            <ProtectedRoute role="instructor"><CourseStudents /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
