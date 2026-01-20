const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package.controller.js");

// Create a new package
router.post("/packages", packageController.createPackage);

// Get all packages with optional filters (name, slug)
router.get("/packages", packageController.getAllPackages);

// Get package by ID
router.get("/packages/:id", packageController.getPackageById);

// Get package by Name
router.get("/packages/name/:name", packageController.getPackageByName);

// Get package by Slug
router.get("/packages/slug/:slug", packageController.getPackageBySlug);

// Get packages by Month (optional year)
// Example: /packages/month?month=3&year=2026
router.get("/packages/month", packageController.getPackagesByMonth);

// Get packages by Date (YYYY-MM-DD)
// Example: /packages/date?date=2026-01-16
router.get("/packages/date", packageController.getPackagesByDate);

// Update package
router.put("/packages/:id", packageController.updatePackage);

// Delete package
router.delete("/packages/:id", packageController.deletePackage);

module.exports = router;
