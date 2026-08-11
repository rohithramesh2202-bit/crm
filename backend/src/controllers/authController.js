const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  cookieOptions,
} = require("../utils/generateTokens");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// @desc  Register the first admin / new user (admin only after bootstrap)
// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required.");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("A user with this email already exists.");
  }

  const userCount = await User.countDocuments();
  const requesterIsAdmin = req.user && req.user.role === "admin";

  // The unauthenticated bootstrap route only ever works for the very first user.
  if (userCount > 0 && !requesterIsAdmin) {
    res.status(403);
    throw new Error("Registration is closed. Ask an admin to create your account.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: userCount === 0 ? "admin" : role || "sales",
  });

  res.status(201).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc  Login user, issue access + refresh cookies
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email }).select("+password +refreshTokenHash");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated.");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  user.lastLogin = new Date();
  await user.save();

  res.cookie("accessToken", accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));

  res.json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc  Issue a new access token using the refresh token cookie
// @route POST /api/auth/refresh
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error("No refresh token provided. Please log in.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error("Refresh token invalid or expired. Please log in again.");
  }

  const user = await User.findById(decoded.id).select("+refreshTokenHash");
  if (!user || user.refreshTokenHash !== hashToken(token)) {
    res.status(401);
    throw new Error("Refresh token invalid. Please log in again.");
  }

  const newAccessToken = generateAccessToken(user);
  res.cookie("accessToken", newAccessToken, cookieOptions(15 * 60 * 1000));

  res.json({ success: true, message: "Token refreshed." });
});

// @desc  Logout - clear cookies and invalidate refresh token
// @route POST /api/auth/logout
const logoutUser = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { refreshTokenHash: null });
    } catch (err) {
      // token already invalid, nothing to clean up
    }
  }
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
  res.json({ success: true, message: "Logged out successfully." });
});

// @desc  Get current logged-in user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = { registerUser, loginUser, refreshToken, logoutUser, getMe };
