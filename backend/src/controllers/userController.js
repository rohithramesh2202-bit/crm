const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @desc  List all users (for assignment dropdowns) - name/email/role only
// @route GET /api/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("name email role isActive lastLogin createdAt");
  res.json({ success: true, data: users });
});

// @desc  Admin: update a user's role or active status
// @route PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive, name } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...(role && { role }), ...(typeof isActive === "boolean" && { isActive }), ...(name && { name }) },
    { new: true }
  ).select("name email role isActive");
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  res.json({ success: true, data: user });
});

// @desc  Admin: delete a user
// @route DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  res.json({ success: true, message: "User removed." });
});

module.exports = { getUsers, updateUser, deleteUser };
