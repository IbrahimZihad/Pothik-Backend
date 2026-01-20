const BookingService = require("../services/booking.service");
const { Booking } = require("../models");

// -----------------------------------------------------------------------------
// CREATE BOOKING
// -----------------------------------------------------------------------------
exports.createBooking = async (req, res) => {
  try {
    const booking = await BookingService.createBooking(req.body);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking)
      return res.status(404).json({ success: false, error: "Booking not found" });

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get bookings by user
exports.getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.findAll({ where: { user_id: req.params.user_id } });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update status
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking)
      return res.status(404).json({ success: false, error: "Booking not found" });

    await booking.update({ status: req.body.status });

    res.json({
      success: true,
      message: "Booking status updated",
      data: booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking)
      return res.status(404).json({ success: false, error: "Booking not found" });

    await booking.destroy();

    res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
