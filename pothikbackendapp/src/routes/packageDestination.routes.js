const express = require("express");
const router = express.Router();
const controller = require("../controllers/packageDestination.controller.js");

// Add destination to package
router.post("/add", controller.addDestinationToPackage);

// Remove destination from package
router.delete("/remove", controller.removeDestinationFromPackage);

// Get destinations by package
router.get("/package/:package_id", controller.getDestinationsByPackage);

// Get packages by destination
router.get("/destination/:destination_id", controller.getPackagesByDestination);

module.exports = router;
