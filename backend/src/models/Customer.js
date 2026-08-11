const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    billingAddress: { type: String, trim: true },
    shippingAddress: { type: String, trim: true },
    customerType: {
      type: String,
      enum: ["direct", "distributor", "oem"],
      default: "direct",
    },
    gstNumber: { type: String, trim: true },
    accountOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    originLead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

customerSchema.index({ name: "text", company: "text", email: "text" });

module.exports = mongoose.model("Customer", customerSchema);
