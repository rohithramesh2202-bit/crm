const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
  message: { success: false, message: "Too many login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public: first registration bootstraps the admin account
router.post("/register", protect, authorize("admin"), registerUser);
router.post("/register-first-admin", registerUser); // guarded internally: only works while no users exist
router.post("/login", loginLimiter, loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);

module.exports = router;
