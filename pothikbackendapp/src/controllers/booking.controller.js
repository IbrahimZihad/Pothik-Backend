const { Booking } = require('../models');
const BookingService = require('../services/booking.service');
const { createNotification } = require('../controllers/notification.controller');

// ─────────────────────────────────────────────
// CREATE BOOKING
// ─────────────────────────────────────────────
exports.createBooking = async (req, res) => {
  try {
    const booking = await BookingService.createBooking(req.body);

    await createNotification({
      user_id: booking.user_id,
      type: 'booking',
      title: 'Booking Created',
      message: `Your booking #${booking.booking_id} has been created successfully and is pending confirmation.`,
      link: '/user/bookings',
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// GET ALL BOOKINGS
// ─────────────────────────────────────────────
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [], // add User, Package if needed
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// GET BOOKING BY ID
// ─────────────────────────────────────────────
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    return res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// GET BOOKINGS BY USER
// ─────────────────────────────────────────────
exports.getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.params.user_id },
    });

    return res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// UPDATE BOOKING STATUS
// ─────────────────────────────────────────────
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    await booking.update({ status: req.body.status });

    const statusLabels = {
      confirmed: 'Confirmed ✅',
      cancelled: 'Cancelled ❌',
      completed: 'Completed 🎉',
      pending: 'Pending ⏳',
    };

    const statusText = statusLabels[req.body.status] || req.body.status;

    await createNotification({
      user_id: booking.user_id,
      type: 'booking',
      title: 'Booking Status Updated',
      message: `Your booking #${booking.booking_id} status has been updated to ${statusText}.`,
      link: '/user/bookings',
    });

    return res.json({
      success: true,
      message: 'Booking status updated',
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// DELETE BOOKING
// ─────────────────────────────────────────────
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    await booking.destroy();

    return res.json({
      success: true,
      message: 'Booking deleted',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};