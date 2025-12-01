const express = require("express");
const router = express.Router();

const transportController = require("../controllers/transportController");

// ============================================================================
//                              TRANSPORT ROUTES
// ============================================================================

// CREATE transport
router.post("/transports", transportController.createTransport);

// GET all transports
router.get("/transports", transportController.getAllTransports);

// GET single transport with vehicles
router.get("/transports/:id", transportController.getTransportById);

// UPDATE transport
router.put("/transports/:id", transportController.updateTransport);

// DELETE transport
router.delete("/transports/:id", transportController.deleteTransport);

// ============================================================================
//                              VEHICLE ROUTES
// ============================================================================

// ADD VEHICLE to a transport
router.post("/transports/:transport_id/vehicles", transportController.addVehicle);

// GET ALL VEHICLES of a transport
router.get("/transports/:transport_id/vehicles", transportController.getVehicles);

// UPDATE VEHICLE
router.put("/vehicles/:vehicle_id", transportController.updateVehicle);

// DELETE VEHICLE
router.delete("/vehicles/:vehicle_id", transportController.deleteVehicle);

module.exports = router;
