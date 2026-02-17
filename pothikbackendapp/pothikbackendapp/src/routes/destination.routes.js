/**
 * Author: Asif Mia
 * Destination and Spot Routes
 * Defines routes for managing destinations and their associated spots.
 * 
 */

const express = require("express");
const router = express.Router();

const destinationController = require("../controllers/destination.controller.js");

// ============================================================================
//                              DESTINATION ROUTES
// ============================================================================

// CREATE destination
router.post("/destinations", destinationController.createDestination);

// GET all destinations
router.get("/destinations", destinationController.getAllDestinations);

// GET single destination (with related data if needed)
router.get("/destinations/:id", destinationController.getDestinationById);

// UPDATE destination
router.put("/destinations/:id", destinationController.updateDestination);

// DELETE destination
router.delete("/destinations/:id", destinationController.deleteDestination);


module.exports = router;
