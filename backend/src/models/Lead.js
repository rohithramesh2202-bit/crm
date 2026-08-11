const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    source: {
      type: String,
      enum: ["website", "referral", "cold-call", "exhibition", "social-media", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "negotiation", "won", "lost"],
      default: "new",
    },
    estimatedValue: { type: Number, default: 0 },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
    convertedToCustomer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

leadSchema.index({ name: "text", company: "text", email: "text" });

module.exports = mongoose.model("Lead", leadSchema);
