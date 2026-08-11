const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
  sendQuotation,
} = require("../controllers/quotationController");

const router = express.Router();

router.use(protect);
router.route("/").get(getAll).post(createOne);
router.route("/:id").get(getOne).put(updateOne).delete(deleteOne);
router.post("/:id/send", sendQuotation);

module.exports = router;
