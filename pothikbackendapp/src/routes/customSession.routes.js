/**
 * Title : customSession routes
 * -----------------------------
 * Build by : Md. Foysal Hossain Khan
 */
const express = require("express");
const router = express.Router();

// Import the controller correctly
const customSessionController = require("../controllers/customSession.controller");

// CREATE CUSTOM SESSION
router.post("/", customSessionController.createSession);

// ADD SERVICE TO SESSION
router.post("/service", customSessionController.addService);

// GET SESSION BY ID WITH SERVICES
router.get("/:session_id", customSessionController.getSessionDetails);

// UPDATE SESSION
router.patch("/:session_id", customSessionController.updateSession);

// DELETE SESSION (AND SERVICES)
router.delete("/:session_id", customSessionController.deleteSession);

// REMOVE ONE SERVICE FROM SESSION
router.delete("/service/:id", customSessionController.removeService);

// GET ALL SESSIONS (ADMIN)
router.get("/", customSessionController.getAllSessions);

module.exports = router;
