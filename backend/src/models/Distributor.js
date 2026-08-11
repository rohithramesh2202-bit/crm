const mongoose = require("mongoose");

const distributorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    region: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    agreementStart: { type: Date },
    agreementEnd: { type: Date },
    productLines: [{ type: String, trim: true }],
    linkedCustomer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Distributor", distributorSchema);
