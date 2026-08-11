const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
  updateStatus,
  getDueFollowUps,
  sendFollowUpEmail,
} = require("../controllers/followUpController");

const router = express.Router();

router.use(protect);
router.get("/due", getDueFollowUps);
router.route("/").get(getAll).post(createOne);
router.route("/:id").get(getOne).put(updateOne).delete(deleteOne);
router.patch("/:id/status", updateStatus);
router.post("/:id/send-email", sendFollowUpEmail);

module.exports = router;
