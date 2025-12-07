const { Payment } = require('../models');

// Create new payment
exports.createPayment = async (req, res) => {
  try {
    const { booking_id, amount, method, status } = req.body;

    const payment = await Payment.create({
      booking_id,
      amount,
      method,
      status: status || 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Payment creation failed',
      details: err.message
    });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll();

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get payments by booking ID
exports.getPaymentsByBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const payments = await Payment.findAll({
      where: { booking_id }
    });

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    await payment.update({ status });

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    await payment.destroy();

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
