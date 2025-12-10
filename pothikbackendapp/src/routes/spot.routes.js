/**
 * Author: Asif Mia
 * Spot Routes
 * Defines routes for managing spots associated with destinations.
 */

const express = require("express");
const router = express.Router();

const spotController = require("../controllers/spot.controller.js");

// ============================================================================
//                                  SPOT ROUTES
// ============================================================================

// CREATE a new spot under a specific destination
// POST /destinations/:destination_id/spots
router.post(
  "/destinations/:destination_id/spots",
  spotController.createSpot
);

// GET all spots (optional route, lists all spots)
router.get("/spots", spotController.getAllSpots);

// GET all spots of a specific destination
// GET /destinations/:destination_id/spots
router.get(
  "/destinations/:destination_id/spots",
  spotController.getSpotsByDestination
);

// GET a single spot by ID
// GET /spots/:spot_id
router.get("/spots/:spot_id", spotController.getSpotById);

// GET a single spot by name (slug-based)
// GET /spots/name/:name
router.get("/spots/name/:name", spotController.getSpotByName);

// UPDATE a spot by ID
// PUT /spots/:spot_id
router.put("/spots/:spot_id", spotController.updateSpot);

// DELETE a spot by ID
// DELETE /spots/:spot_id
router.delete("/spots/:spot_id", spotController.deleteSpot);

module.exports = router;
