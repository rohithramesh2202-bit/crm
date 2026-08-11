const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { getUsers, updateUser, deleteUser } = require("../controllers/userController");

const router = express.Router();

router.use(protect);
router.get("/", getUsers);
router.put("/:id", authorize("admin"), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;
