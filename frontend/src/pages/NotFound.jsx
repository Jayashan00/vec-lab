import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="center">
      <h2>404 - Page Not Found</h2>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  );
}
