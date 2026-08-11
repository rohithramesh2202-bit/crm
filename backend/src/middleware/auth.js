const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401);
    throw new Error("Not authenticated. Please log in.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401);
      throw new Error("User not found or deactivated.");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Session expired or invalid. Please log in again.");
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("You do not have permission to perform this action.");
    }
    next();
  };
};

module.exports = { protect, authorize };
