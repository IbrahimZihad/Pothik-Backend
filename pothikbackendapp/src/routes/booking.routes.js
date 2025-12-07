const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

// Create booking
router.post('/', bookingController.createBooking);

// Get all bookings
router.get('/', bookingController.getAllBookings);

// Get booking by ID
router.get('/:id', bookingController.getBookingById);

// Get bookings by user ID
router.get('/user/:user_id', bookingController.getBookingsByUser);

// Update booking status
router.put('/:id/status', bookingController.updateBookingStatus);

// Delete booking
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;