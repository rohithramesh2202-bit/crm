const express = require("express");
const { protect } = require("../middleware/auth");
const { sendAdHocEmail, getEmailLogs } = require("../controllers/emailController");

const router = express.Router();

router.use(protect);
router.post("/send", sendAdHocEmail);
router.get("/logs", getEmailLogs);

module.exports = router;
