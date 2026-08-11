const Distributor = require("../models/Distributor");
const buildCrud = require("../utils/crudFactory");

const crud = buildCrud(Distributor, {
  searchFields: ["name", "region", "contactPerson", "email"],
  populate: { path: "linkedCustomer", select: "name company" },
});

module.exports = crud;
