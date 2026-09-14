import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Blocks a route unless the user is logged in.
// Optionally restricts it further to a specific role (student/instructor)
// which mirrors the backend's RBAC on the frontend for a smooth UX.
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
