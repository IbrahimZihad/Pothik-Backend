const express = require("express");
const router = express.Router();

const loyaltyController = require("../controllers/loyalty.controller");

// Add points
router.post("/add", loyaltyController.addPoints);

// Deduct points
router.post("/deduct", loyaltyController.deductPoints);

// Get all history
router.get("/", loyaltyController.getAllHistory);

// Get history for a user
router.get("/user/:user_id", loyaltyController.getUserHistory);

// Delete a history log
router.delete("/:id", loyaltyController.deleteLog);

module.exports = router;
