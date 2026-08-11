const asyncHandler = require("express-async-handler");
const EmailLog = require("../models/EmailLog");
const sendEmail = require("../utils/sendEmail");

// @desc  Send an ad-hoc email (not tied to a quotation/follow-up)
// @route POST /api/emails/send
const sendAdHocEmail = asyncHandler(async (req, res) => {
  const { to, subject, message, relatedKind, relatedId } = req.body;
  if (!to || !subject || !message) {
    res.status(400);
    throw new Error("to, subject and message are required.");
  }

  const html = `<div style="font-family:Arial,sans-serif;">${message}</div>`;

  try {
    await sendEmail({ to, subject, html });
    const log = await EmailLog.create({
      to,
      subject,
      body: html,
      relatedTo: relatedKind && relatedId ? { kind: relatedKind, item: relatedId } : { kind: "General" },
      status: "sent",
      sentBy: req.user._id,
    });
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    const log = await EmailLog.create({
      to,
      subject,
      body: html,
      relatedTo: relatedKind && relatedId ? { kind: relatedKind, item: relatedId } : { kind: "General" },
      status: "failed",
      error: err.message,
      sentBy: req.user._id,
    });
    res.status(502).json({ success: false, message: "Failed to send email.", data: log });
  }
});

// @desc  List email logs (most recent first)
// @route GET /api/emails/logs
const getEmailLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const [items, total] = await Promise.all([
    EmailLog.find()
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("sentBy", "name email"),
    EmailLog.countDocuments(),
  ]);
  res.json({
    success: true,
    data: items,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

module.exports = { sendAdHocEmail, getEmailLogs };
