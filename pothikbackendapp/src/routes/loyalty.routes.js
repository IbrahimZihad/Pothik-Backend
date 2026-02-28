const express = require("express");
const router = express.Router();

const loyaltyController = require("../controllers/loyalty.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

// Get user balance + summary
router.get("/balance/:user_id", authMiddleware, loyaltyController.getUserBalance);

// Add points
router.post("/add", authMiddleware, loyaltyController.addPoints);

// Deduct points
router.post("/deduct", authMiddleware, loyaltyController.deductPoints);

// Get all history
router.get("/", authMiddleware, loyaltyController.getAllHistory);

// Get history for a user
router.get("/user/:user_id", authMiddleware, loyaltyController.getUserHistory);

// Delete a history log
router.delete("/:id", authMiddleware, loyaltyController.deleteLog);

module.exports = router;
