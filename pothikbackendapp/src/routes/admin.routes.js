const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller.js");
const { authMiddleware, isAdmin } = require("../middleware/auth.middleware.js");

// Admin CRUD (from remote)
router.post("/create", adminController.createAdmin);
router.post("/login", adminController.loginAdmin);
router.get("/", authMiddleware, adminController.getAllAdmins);
router.get("/:id", authMiddleware, adminController.getAdminById);
router.put("/:id", authMiddleware, adminController.updateAdmin);
router.delete("/:id", authMiddleware, adminController.deleteAdmin);

// Dashboard & Bookings (from local)
router.get("/dashboard", isAdmin, adminController.getDashboardData);
router.get("/bookings", isAdmin, adminController.getAllBookings);
router.post("/bookings/:id/approve", isAdmin, adminController.approveBooking);
router.post("/bookings/:id/assign-guide", isAdmin, adminController.assignGuide);
router.post("/bookings/:id/cancel", isAdmin, adminController.cancelBooking);
router.post("/bookings/:id/assign-hotel", isAdmin, adminController.assignHotel);
router.post("/bookings/:id/assign-transport", isAdmin, adminController.assignTransport);

module.exports = router;