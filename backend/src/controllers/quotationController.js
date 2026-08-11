const asyncHandler = require("express-async-handler");
const Quotation = require("../models/Quotation");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const EmailLog = require("../models/EmailLog");
const sendEmail = require("../utils/sendEmail");
const buildCrud = require("../utils/crudFactory");

const crud = buildCrud(Quotation, {
  searchFields: ["quotationNumber", "status"],
  populate: [{ path: "preparedBy", select: "name email" }],
});

// override createOne to stamp preparedBy
const createOne = asyncHandler(async (req, res) => {
  const quotation = await Quotation.create({ ...req.body, preparedBy: req.user._id });
  res.status(201).json({ success: true, data: quotation });
});

const buildQuotationHtml = (quotation, recipientName) => {
  const rows = quotation.items
    .map(
      (i) => `<tr>
        <td style="padding:8px;border:1px solid #e2e8f0;">${i.description}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">${i.quantity}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${i.unitPrice.toFixed(2)}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${i.total.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;">
    <h2 style="color:#0F8B8D;">Quotation ${quotation.quotationNumber}</h2>
    <p>Dear ${recipientName || "Customer"},</p>
    <p>Please find your quotation details below.</p>
    <table style="border-collapse:collapse;width:100%;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">Description</th>
          <th style="padding:8px;border:1px solid #e2e8f0;">Qty</th>
          <th style="padding:8px;border:1px solid #e2e8f0;">Unit Price</th>
          <th style="padding:8px;border:1px solid #e2e8f0;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="text-align:right;margin-top:12px;">
      Subtotal: ${quotation.subTotal.toFixed(2)} ${quotation.currency}<br/>
      Discount: ${quotation.discountPercent}%<br/>
      Tax: ${quotation.taxPercent}%<br/>
      <strong>Grand Total: ${quotation.grandTotal.toFixed(2)} ${quotation.currency}</strong>
    </p>
    ${quotation.validUntil ? `<p>Valid until: ${new Date(quotation.validUntil).toDateString()}</p>` : ""}
    ${quotation.notes ? `<p>${quotation.notes}</p>` : ""}
    <p>Thank you for your business.</p>
  </div>`;
};

// @desc  Email a quotation to its related lead/customer
// @route POST /api/quotations/:id/send
const sendQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) {
    res.status(404);
    throw new Error("Quotation not found.");
  }

  const Model = quotation.relatedTo.kind === "Lead" ? Lead : Customer;
  const contact = await Model.findById(quotation.relatedTo.item);
  const recipient = req.body.email || contact?.email;

  if (!recipient) {
    res.status(400);
    throw new Error("No recipient email found. Provide one or add it to the record.");
  }

  const html = buildQuotationHtml(quotation, contact?.name);
  const subject = `Quotation ${quotation.quotationNumber} from ${process.env.SMTP_FROM_NAME || "Our Company"}`;

  try {
    await sendEmail({ to: recipient, subject, html });
    quotation.status = quotation.status === "draft" ? "sent" : quotation.status;
    quotation.sentHistory.push({ sentTo: recipient });
    await quotation.save();

    await EmailLog.create({
      to: recipient,
      subject,
      body: html,
      relatedTo: { kind: "Quotation", item: quotation._id },
      status: "sent",
      sentBy: req.user._id,
    });

    res.json({ success: true, message: `Quotation emailed to ${recipient}.`, data: quotation });
  } catch (err) {
    await EmailLog.create({
      to: recipient,
      subject,
      body: html,
      relatedTo: { kind: "Quotation", item: quotation._id },
      status: "failed",
      error: err.message,
      sentBy: req.user._id,
    });
    res.status(502);
    throw new Error("Failed to send email. Check SMTP configuration.");
  }
});

module.exports = { ...crud, createOne, sendQuotation };
