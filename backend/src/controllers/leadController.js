const asyncHandler = require("express-async-handler");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const buildCrud = require("../utils/crudFactory");

const crud = buildCrud(Lead, {
  searchFields: ["name", "company", "email", "phone"],
  populate: { path: "assignedTo", select: "name email" },
});

// @desc  Convert a lead into a customer record
// @route POST /api/leads/:id/convert
const convertToCustomer = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found.");
  }
  if (lead.convertedToCustomer) {
    res.status(400);
    throw new Error("This lead has already been converted.");
  }

  const customer = await Customer.create({
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    customerType: req.body.customerType || "direct",
    accountOwner: lead.assignedTo,
    originLead: lead._id,
    notes: lead.notes,
    createdBy: req.user._id,
  });

  console.log(customer)
  lead.status = "won";
  lead.convertedToCustomer = customer._id;
  await lead.save();

  res.status(201).json({ success: true, data: customer });
});

module.exports = { ...crud, convertToCustomer };
