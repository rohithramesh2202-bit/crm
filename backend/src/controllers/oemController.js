const OEM = require("../models/OEM");
const buildCrud = require("../utils/crudFactory");

const crud = buildCrud(OEM, {
  searchFields: ["name", "contactPerson", "email"],
  populate: { path: "linkedCustomer", select: "name company" },
});

module.exports = crud;
