/**
 * Title : customSession routes
 * -----------------------------
 * Table : custom_sessions
 * 
 * Build by : Md. Foysal Hossain Khan
 */
const express = require("express");
const router = express.Router();

// Import the controller correctly
const customSessionController = require("../controllers/customSession.controller");

// ===============================
// CREATE CUSTOM SESSION
// POST /api/customsessions
// ===============================
router.post("/", customSessionController.createSession);

// ===============================
// ADD SERVICE TO SESSION
// POST /api/customsessions/service
// ===============================
router.post("/service", customSessionController.addService);

// ===============================
// GET SESSION BY ID WITH SERVICES
// GET /api/customsessions/:session_id
// ===============================
router.get("/:session_id", customSessionController.getSessionDetails);

// ===============================
// UPDATE SESSION
// PATCH /api/customsessions/:session_id
// ===============================
router.patch("/:session_id", customSessionController.updateSession);

// ===============================
// DELETE SESSION (AND SERVICES)
// DELETE /api/customsessions/:session_id
// ===============================
router.delete("/:session_id", customSessionController.deleteSession);

// ===============================
// REMOVE ONE SERVICE FROM SESSION
// DELETE /api/customsessions/service/:id
// ===============================
router.delete("/service/:id", customSessionController.removeService);

// ===============================
// GET ALL SESSIONS (ADMIN)
// GET /api/customsessions
// ===============================
router.get("/", customSessionController.getAllSessions);

module.exports = router;
