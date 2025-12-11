const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");

// Create booking
router.post("/", auth, bookingController.createBooking);

// Get all bookings
router.get("/", auth, bookingController.getAllBookings);

// Get booking by ID
router.get("/:id", auth, bookingController.getBookingById);

// Get bookings by user
router.get("/user/:user_id", auth, bookingController.getBookingsByUser);

// Update booking status
router.put("/:id/status", auth, bookingController.updateBookingStatus);

// Delete booking
router.delete("/:id", auth, bookingController.deleteBooking);

module.exports = router;
