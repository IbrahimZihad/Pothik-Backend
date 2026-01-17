const express = require("express");
const router = express.Router();

const packageServiceController = require("../controllers/service.controller.js");

// ======================
// Package Service Routes
// ======================

// Add a single service to a package
router.post("/add", packageServiceController.addServiceToPackage);

// Remove a service from a package (by relationship ID)
router.delete("/:id", packageServiceController.removeServiceFromPackage);

// Get all services for a package (optionally by type ?service_type=hotel)
router.get("/package/:package_id", packageServiceController.getPackageServices);

// Get packages that use a specific service
router.get("/service/:service_type/:service_id", packageServiceController.getPackagesByService);

// Bulk add services to a package
router.post("/bulk", packageServiceController.bulkAddServicesToPackage);

// Update a service (replace inside a package)
router.put("/:id", packageServiceController.updatePackageService);

// Get service counts/statistics for a package
router.get("/stats/:package_id", packageServiceController.getPackageServiceStats);

module.exports = router;
