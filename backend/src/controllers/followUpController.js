const asyncHandler = require("express-async-handler");
const FollowUp = require("../models/FollowUp");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const EmailLog = require("../models/EmailLog");
const sendEmail = require("../utils/sendEmail");
const buildCrud = require("../utils/crudFactory");

const crud = buildCrud(FollowUp, {
  populate: [{ path: "assignedTo", select: "name email" }],
});

const createOne = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: followUp });
});

// @desc  Mark a follow-up as done/missed with an outcome note
// @route PATCH /api/followups/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  const { status, outcome } = req.body;
  const followUp = await FollowUp.findByIdAndUpdate(
    req.params.id,
    { status, outcome },
    { new: true }
  );
  if (!followUp) {
    res.status(404);
    throw new Error("Follow-up not found.");
  }
  res.json({ success: true, data: followUp });
});

// @desc  Get follow-ups due today or overdue (for dashboard widget)
// @route GET /api/followups/due
const getDueFollowUps = asyncHandler(async (req, res) => {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const items = await FollowUp.find({
    status: "open",
    dueDate: { $lte: endOfToday },
  })
    .sort({ dueDate: 1 })
    .populate("assignedTo", "name email");

  res.json({ success: true, data: items });
});

// @desc  Email the assigned contact as part of a follow-up
// @route POST /api/followups/:id/send-email
const sendFollowUpEmail = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findById(req.params.id);
  if (!followUp) {
    res.status(404);
    throw new Error("Follow-up not found.");
  }

  const Model = followUp.relatedTo.kind === "Lead" ? Lead : Customer;
  const contact = await Model.findById(followUp.relatedTo.item);
  const recipient = req.body.email || contact?.email;

  if (!recipient) {
    res.status(400);
    throw new Error("No recipient email found.");
  }

  const subject = req.body.subject || `Following up - ${contact?.name || ""}`;
  const html = `<div style="font-family:Arial,sans-serif;">${req.body.message || "<p>Just checking in on our last conversation.</p>"}</div>`;

  try {
    await sendEmail({ to: recipient, subject, html });
    await EmailLog.create({
      to: recipient,
      subject,
      body: html,
      relatedTo: { kind: "FollowUp", item: followUp._id },
      status: "sent",
      sentBy: req.user._id,
    });
    res.json({ success: true, message: `Email sent to ${recipient}.` });
  } catch (err) {
    await EmailLog.create({
      to: recipient,
      subject,
      body: html,
      relatedTo: { kind: "FollowUp", item: followUp._id },
      status: "failed",
      error: err.message,
      sentBy: req.user._id,
    });
    res.status(502);
    throw new Error("Failed to send email. Check SMTP configuration.");
  }
});

module.exports = { ...crud, createOne, updateStatus, getDueFollowUps, sendFollowUpEmail };
