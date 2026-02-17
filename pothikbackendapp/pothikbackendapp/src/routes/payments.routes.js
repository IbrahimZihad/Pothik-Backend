const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Create payment
router.post('/', paymentController.createPayment);

// Get all payments
router.get('/', paymentController.getAllPayments);

// Get payment by ID
router.get('/:id', paymentController.getPaymentById);

// Get payments by booking ID
router.get('/booking/:booking_id', paymentController.getPaymentsByBooking);

// Update payment status
router.put('/:id/status', paymentController.updatePaymentStatus);

// Delete payment
router.delete('/:id', paymentController.deletePayment);

module.exports = router;