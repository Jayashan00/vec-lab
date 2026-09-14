const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// "protect" verifies the JWT sent in the Authorization header and attaches
// the logged-in user (minus password) to req.user for later handlers.
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user no longer exists");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});

// "authorize" is a factory that returns middleware restricting a route
// to specific roles, e.g. authorize("instructor").
// This is what implements role-based access control (RBAC) at the route level.
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied. This action requires one of these roles: ${allowedRoles.join(", ")}`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
