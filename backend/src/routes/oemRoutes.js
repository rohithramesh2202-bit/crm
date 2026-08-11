const express = require("express");
const { protect } = require("../middleware/auth");
const { getAll, getOne, createOne, updateOne, deleteOne } = require("../controllers/oemController");

const router = express.Router();

router.use(protect);
router.route("/").get(getAll).post(createOne);
router.route("/:id").get(getOne).put(updateOne).delete(deleteOne);

module.exports = router;
