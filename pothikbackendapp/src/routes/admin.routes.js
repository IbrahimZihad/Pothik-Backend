const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller.js");
const {isAdmin} = require("../middleware/authMiddleware.js");

//dashboard data
router.get("/dashboard", isAdmin, adminController.getDashboardData);
//view all bookings
router.get("/bookings", isAdmin, adminController.getAllBookings);
//approve booking
router.post("/bookings/:id/approve", isAdmin, adminController.approveBooking);
//assign guide
router.post("/bookings/:id/assign-guide", isAdmin, adminController.assignGuide);
//cancel booking
router.post("/bookings/:id/cancel", isAdmin, adminController.cancelBooking);
//assign hotel
router.post("/bookings/:id/assign-hotel", isAdmin, adminController.assignHotel);
//assign transport
router.post("/bookings/:id/assign-transport", isAdmin, adminController.assignTransport);


module.exports = router;