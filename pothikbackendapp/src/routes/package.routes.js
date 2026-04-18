const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package.controller.js");

// Create a new package
router.post("/packages", packageController.createPackage);

// Get all packages with optional filters (name, slug)
router.get("/packages", packageController.getAllPackages);

// ✅ Static/specific routes before /:id
router.get("/packages/month", packageController.getPackagesByMonth);
router.get("/packages/date", packageController.getPackagesByDate);
router.get("/packages/name/:name", packageController.getPackageByName);
router.get("/packages/slug/:slug", packageController.getPackageBySlug);

// ✅ Parameterized route last
router.get("/packages/:id", packageController.getPackageById);

// Update package
router.put("/packages/:id", packageController.updatePackage);

// Delete package
router.delete("/packages/:id", packageController.deletePackage);

module.exports = router;