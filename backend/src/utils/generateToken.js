const jwt = require("jsonwebtoken");

// Signs a JWT containing the user's id and role.
// The role is embedded so protected routes can do RBAC checks without
// hitting the database on every single request.
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
