const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");

// Create booking
router.post("/booking", bookingController.createBooking);

// Get all bookings
router.get("/booking", bookingController.getAllBookings);

// Get booking by ID
router.get("/booking/:id", bookingController.getBookingById);

// Get bookings by user
router.get("/booking/user/:user_id", bookingController.getBookingsByUser);

// Update booking status
router.put("/booking/:id/status", bookingController.updateBookingStatus);

// Delete booking
router.delete("/booking/:id", bookingController.deleteBooking);

module.exports = router;
