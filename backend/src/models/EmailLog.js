const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String },
    relatedTo: {
      kind: { type: String, enum: ["Lead", "Customer", "Quotation", "FollowUp", "General"] },
      item: { type: mongoose.Schema.Types.ObjectId, refPath: "relatedTo.kind" },
    },
    status: { type: String, enum: ["sent", "failed"], default: "sent" },
    error: { type: String },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailLog", emailLogSchema);
