const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// SSLCommerz payment lifecycle
router.post('/init', paymentController.initiateSslCommerzPayment);
router.all('/success', paymentController.sslCommerzSuccess);
router.all('/fail', paymentController.sslCommerzFail);
router.all('/cancel', paymentController.sslCommerzCancel);
router.post('/ipn', paymentController.sslCommerzIpn);
router.get('/validate/:tran_id', paymentController.validatePaymentByTranId);

// Create payment
router.post('/', paymentController.createPayment);

// Get all payments
router.get('/', paymentController.getAllPayments);

// Get payments by booking ID
router.get('/booking/:booking_id', paymentController.getPaymentsByBooking);

// Get payment by ID
router.get('/:id', paymentController.getPaymentById);

// Update payment status
router.put('/:id/status', paymentController.updatePaymentStatus);

// Delete payment
router.delete('/:id', paymentController.deletePayment);

module.exports = router;