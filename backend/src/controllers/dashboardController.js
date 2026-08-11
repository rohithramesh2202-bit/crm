const asyncHandler = require("express-async-handler");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Distributor = require("../models/Distributor");
const OEM = require("../models/OEM");
const Quotation = require("../models/Quotation");
const FollowUp = require("../models/FollowUp");

// @desc  Aggregate counts and pipeline stats for the dashboard
// @route GET /api/dashboard/summary
const getSummary = asyncHandler(async (req, res) => {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [
    totalLeads,
    totalCustomers,
    totalDistributors,
    totalOEMs,
    leadsByStatus,
    quotationsByStatus,
    quotationValueAgg,
    dueFollowUps,
    recentLeads,
  ] = await Promise.all([
    Lead.countDocuments(),
    Customer.countDocuments(),
    Distributor.countDocuments(),
    OEM.countDocuments(),
    Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Quotation.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Quotation.aggregate([
      { $match: { status: { $in: ["sent", "accepted"] } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]),
    FollowUp.countDocuments({ status: "open", dueDate: { $lte: endOfToday } }),
    Lead.find().sort({ createdAt: -1 }).limit(5).select("name company status createdAt"),
  ]);

  res.json({
    success: true,
    data: {
      totals: { totalLeads, totalCustomers, totalDistributors, totalOEMs },
      leadsByStatus,
      quotationsByStatus,
      pipelineValue: quotationValueAgg[0]?.total || 0,
      dueFollowUps,
      recentLeads,
    },
  });
});

module.exports = { getSummary };
