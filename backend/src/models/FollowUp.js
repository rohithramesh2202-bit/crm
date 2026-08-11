const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    relatedTo: {
      kind: { type: String, enum: ["Lead", "Customer"], required: true },
      item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "relatedTo.kind" },
    },
    type: {
      type: String,
      enum: ["call", "email", "meeting", "demo", "other"],
      default: "call",
    },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["open", "done", "missed"], default: "open" },
    notes: { type: String, trim: true },
    outcome: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

followUpSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model("FollowUp", followUpSchema);
