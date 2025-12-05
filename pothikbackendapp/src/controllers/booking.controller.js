const { Booking } = require('../models');

// Create new booking
exports.createBooking = async (req, res) => {
    try {
        const {
            user_id,
            package_type,
            package_id,
            session_id,
            total_price,
            coupon_id,
            discounted_price,
            loyalty_points_used,
            loyalty_points_earned,
            status
        } = req.body;

        const booking = await Booking.create({
            user_id,
            package_type,
            package_id,
            session_id,
            total_price,
            coupon_id,
            discounted_price,
            loyalty_points_used: loyalty_points_used || 0,
            loyalty_points_earned: loyalty_points_earned || 0,
            status: status || 'pending',
        });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Booking creation failed',
            details: err.message
        });
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll();

        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Get bookings by user ID
exports.getBookingsByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const bookings = await Booking.findAll({
            where: { user_id }
        });

        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const booking = await Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        await booking.update({ status });

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        await booking.destroy();

        res.json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
