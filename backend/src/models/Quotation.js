const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: { type: String, unique: true },
    relatedTo: {
      kind: { type: String, enum: ["Lead", "Customer"], required: true },
      item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "relatedTo.kind" },
    },
    items: [lineItemSchema],
    subTotal: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    validUntil: { type: Date },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected", "expired"],
      default: "draft",
    },
    notes: { type: String, trim: true },
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sentHistory: [
      {
        sentAt: { type: Date, default: Date.now },
        sentTo: String,
      },
    ],
  },
  { timestamps: true }
);

quotationSchema.pre("validate", async function (next) {
  if (!this.quotationNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("Quotation").countDocuments({
      createdAt: { $gte: new Date(`${year}-01-01`) },
    });
    this.quotationNumber = `QT-${year}-${String(count + 1).padStart(4, "0")}`;
  }

  let subTotal = 0;
  this.items.forEach((item) => {
    item.total = item.quantity * item.unitPrice;
    subTotal += item.total;
  });
  this.subTotal = subTotal;
  const afterDiscount = subTotal - (subTotal * (this.discountPercent || 0)) / 100;
  this.grandTotal = afterDiscount + (afterDiscount * (this.taxPercent || 0)) / 100;

  next();
});

module.exports = mongoose.model("Quotation", quotationSchema);
