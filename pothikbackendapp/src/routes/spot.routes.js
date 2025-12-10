/**
 * Author: Asif Mia
 * Destination and Spot Routes
 * Defines routes for managing destinations and their associated spots.
 */

const express = require("express");
const router = express.Router();

const spotController = require("../controllers/spot.controller.js");

// ============================================================================
//                                  SPOT ROUTES
// ============================================================================

// CREATE a new spot under a destination
router.post(
  "/destinations/:destination_id/spots",
  spotController.createSpot
);

// GET all spots (optional)
router.get("/spots", spotController.getAllSpots);

// GET all spots of a specific destination
router.get(
  "/destinations/:destination_id/spots",
  spotController.getSpotsByDestination
);

// GET a single spot
router.get("/spots/:spot_id", spotController.getSpotById);

// UPDATE a spot
router.put("/spots/:spot_id", spotController.updateSpot);

// DELETE a spot
router.delete("/spots/:spot_id", spotController.deleteSpot);

module.exports = router;
