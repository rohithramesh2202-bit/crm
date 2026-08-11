const asyncHandler = require("express-async-handler");

/**
 * Builds standard CRUD handlers for a Mongoose model.
 * @param {import('mongoose').Model} Model
 * @param {{searchFields?: string[], populate?: string|object}} options
 */
const buildCrud = (Model, options = {}) => {
  const { searchFields = [], populate } = options;

  const getAll = asyncHandler(async (req, res) => {
    const { search, status, page = 1, limit = 20, ...filters } = req.query;
    const query = { ...filters };

    if (search && searchFields.length) {
      query.$or = searchFields.map((f) => ({ [f]: { $regex: search, $options: "i" } }));
    }
    if (status) query.status = status;

    let cursor = Model.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    if (populate) cursor = cursor.populate(populate);

    const [items, total] = await Promise.all([cursor, Model.countDocuments(query)]);

    res.json({
      success: true,
      data: items,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  });

  const getOne = asyncHandler(async (req, res) => {
    let q = Model.findById(req.params.id);
    if (populate) q = q.populate(populate);
    const item = await q;
    if (!item) {
      res.status(404);
      throw new Error("Record not found.");
    }
    res.json({ success: true, data: item });
  });

  const createOne = asyncHandler(async (req, res) => {
    const payload = { ...req.body, createdBy: req.user?._id };
    const item = await Model.create(payload);
    res.status(201).json({ success: true, data: item });
  });

  const updateOne = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      res.status(404);
      throw new Error("Record not found.");
    }
    res.json({ success: true, data: item });
  });

  const deleteOne = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Record not found.");
    }
    res.json({ success: true, message: "Deleted successfully." });
  });

  return { getAll, getOne, createOne, updateOne, deleteOne };
};

module.exports = buildCrud;
