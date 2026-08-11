const Customer = require("../models/Customer");
const buildCrud = require("../utils/crudFactory");

const crud = buildCrud(Customer, {
  searchFields: ["name", "company", "email", "phone","notes"],
  populate: { path: "accountOwner", select: "name email" },
});

module.exports = crud;
