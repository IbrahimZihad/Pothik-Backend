const request = require('supertest');
const express = require('express');

// Mock controller
jest.mock('../controllers/payment.controller', () => ({
  createPayment: jest.fn((req, res) =>
    res.status(201).json({ message: 'Payment created', payment: req.body })
  ),
  getAllPayments: jest.fn((req, res) =>
    res.status(200).json({ payments: [] })
  ),
  getPaymentById: jest.fn((req, res) =>
    res.status(200).json({ payment: { id: req.params.id } })
  ),
  getPaymentsByBooking: jest.fn((req, res) =>
    res.status(200).json({ payments: [], bookingId: req.params.booking_id })
  ),
  updatePaymentStatus: jest.fn((req, res) =>
    res.status(200).json({ message: 'Payment status updated', id: req.params.id, ...req.body })
  ),
  deletePayment: jest.fn((req, res) =>
    res.status(200).json({ message: 'Payment deleted', id: req.params.id })
  ),
}));

const routes = require('../routes/payments.routes');
const controller = require('../controllers/payment.controller');

const app = express();
app.use(express.json());
app.use('/payments', routes);

describe('Payment Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Create Payment ───────────────────────────────────────────
  describe('POST /payments', () => {
    it('should create a new payment', async () => {
      const paymentData = { bookingId: 'booking-1', amount: 500, method: 'card' };
      const res = await request(app)
        .post('/payments')
        .send(paymentData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Payment created');
      expect(res.body).toHaveProperty('payment');
      expect(controller.createPayment).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get All Payments ─────────────────────────────────────────
  describe('GET /payments', () => {
    it('should return all payments', async () => {
      const res = await request(app).get('/payments');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('payments');
      expect(Array.isArray(res.body.payments)).toBe(true);
      expect(controller.getAllPayments).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get Payment By ID ────────────────────────────────────────
  describe('GET /payments/:id', () => {
    it('should return a payment by ID', async () => {
      const res = await request(app).get('/payments/pay-123');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('payment');
      expect(res.body.payment).toHaveProperty('id', 'pay-123');
      expect(controller.getPaymentById).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get Payments By Booking ──────────────────────────────────
  describe('GET /payments/booking/:booking_id', () => {
    it('should return payments for a booking', async () => {
      const res = await request(app).get('/payments/booking/booking-1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('payments');
      expect(res.body).toHaveProperty('bookingId', 'booking-1');
      expect(controller.getPaymentsByBooking).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Update Payment Status ────────────────────────────────────
  describe('PUT /payments/:id/status', () => {
    it('should update the status of a payment', async () => {
      const res = await request(app)
        .put('/payments/pay-123/status')
        .send({ status: 'completed' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Payment status updated');
      expect(res.body).toHaveProperty('id', 'pay-123');
      expect(res.body).toHaveProperty('status', 'completed');
      expect(controller.updatePaymentStatus).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Delete Payment ───────────────────────────────────────────
  describe('DELETE /payments/:id', () => {
    it('should delete a payment by ID', async () => {
      const res = await request(app).delete('/payments/pay-123');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Payment deleted');
      expect(res.body).toHaveProperty('id', 'pay-123');
      expect(controller.deletePayment).toHaveBeenCalledTimes(1);
    });
  });
});