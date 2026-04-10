/**
 * Unit Tests for Payment Controller
 * ====================================
 * Tests: createPayment, getAllPayments, getPaymentById,
 *        getPaymentsByBooking, updatePaymentStatus, deletePayment
 * 
 * (SSLCommerz integration tests are excluded as they require
 *  external gateway configuration and are better suited for
 *  integration tests)
 */

const paymentController = require('../controllers/payment.controller');
const { Payment, Booking } = require('../models');

jest.mock('../models', () => ({
  Payment: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
  Booking: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../config', () => ({
  SSLCOMMERZ_STORE_ID: '',
  SSLCOMMERZ_STORE_PASSWORD: '',
  SSLCOMMERZ_IS_LIVE: false,
  SSLCOMMERZ_SUCCESS_URL: 'http://localhost/success',
  SSLCOMMERZ_FAIL_URL: 'http://localhost/fail',
  SSLCOMMERZ_CANCEL_URL: 'http://localhost/cancel',
  SSLCOMMERZ_IPN_URL: 'http://localhost/ipn',
  POTHIK_FRONTEND_URL: 'http://localhost:3000',
}));

jest.mock('sslcommerz-lts');

const mockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
  get: jest.fn().mockReturnValue('application/json'),
  protocol: 'http',
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

describe('Payment Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE PAYMENT
  // ─────────────────────────────────────────────────────────────────────────
  describe('createPayment', () => {
    it('should create payment and return 201', async () => {
      const payment = { payment_id: 1, booking_id: 1, amount: 5000, status: 'pending' };
      Payment.create.mockResolvedValue(payment);

      const req = mockRequest({ booking_id: 1, amount: 5000, method: 'bkash' });
      const res = mockResponse();

      await paymentController.createPayment(req, res);

      expect(Payment.create).toHaveBeenCalledWith({
        booking_id: 1,
        amount: 5000,
        method: 'bkash',
        status: 'pending',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: payment,
      }));
    });

    it('should use provided status if given', async () => {
      Payment.create.mockResolvedValue({});

      const req = mockRequest({ booking_id: 1, amount: 5000, method: 'cash', status: 'paid' });
      const res = mockResponse();

      await paymentController.createPayment(req, res);

      expect(Payment.create).toHaveBeenCalledWith(expect.objectContaining({
        status: 'paid',
      }));
    });

    it('should return 500 on error', async () => {
      Payment.create.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({});
      const res = mockResponse();

      await paymentController.createPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL PAYMENTS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllPayments', () => {
    it('should return all payments', async () => {
      const payments = [{ payment_id: 1 }, { payment_id: 2 }];
      Payment.findAll.mockResolvedValue(payments);

      const req = mockRequest();
      const res = mockResponse();

      await paymentController.getAllPayments(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: payments,
      });
    });

    it('should return 500 on error', async () => {
      Payment.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await paymentController.getAllPayments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PAYMENT BY ID
  // ─────────────────────────────────────────────────────────────────────────
  describe('getPaymentById', () => {
    it('should return payment by id', async () => {
      const payment = { payment_id: 1 };
      Payment.findByPk.mockResolvedValue(payment);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await paymentController.getPaymentById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: payment });
    });

    it('should return 404 if not found', async () => {
      Payment.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await paymentController.getPaymentById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PAYMENTS BY BOOKING
  // ─────────────────────────────────────────────────────────────────────────
  describe('getPaymentsByBooking', () => {
    it('should return payments for a booking', async () => {
      const payments = [{ payment_id: 1 }];
      Payment.findAll.mockResolvedValue(payments);

      const req = mockRequest({}, { booking_id: 5 });
      const res = mockResponse();

      await paymentController.getPaymentsByBooking(req, res);

      expect(Payment.findAll).toHaveBeenCalledWith({ where: { booking_id: 5 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 1, data: payments });
    });

    it('should return 500 on error', async () => {
      Payment.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { booking_id: 1 });
      const res = mockResponse();

      await paymentController.getPaymentsByBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE PAYMENT STATUS
  // ─────────────────────────────────────────────────────────────────────────
  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      const payment = { payment_id: 1, update: jest.fn().mockResolvedValue(true) };
      Payment.findByPk.mockResolvedValue(payment);

      const req = mockRequest({ status: 'paid' }, { id: 1 });
      const res = mockResponse();

      await paymentController.updatePaymentStatus(req, res);

      expect(payment.update).toHaveBeenCalledWith({ status: 'paid' });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 404 if not found', async () => {
      Payment.findByPk.mockResolvedValue(null);

      const req = mockRequest({ status: 'paid' }, { id: 999 });
      const res = mockResponse();

      await paymentController.updatePaymentStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE PAYMENT
  // ─────────────────────────────────────────────────────────────────────────
  describe('deletePayment', () => {
    it('should delete payment successfully', async () => {
      const payment = { payment_id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Payment.findByPk.mockResolvedValue(payment);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await paymentController.deletePayment(req, res);

      expect(payment.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Payment deleted successfully' });
    });

    it('should return 404 if not found', async () => {
      Payment.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await paymentController.deletePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // INITIATE SSLCOMMERZ PAYMENT
  // ─────────────────────────────────────────────────────────────────────────
  describe('initiateSslCommerzPayment', () => {
    it('should return 500 if SSLCommerz not configured', async () => {
      const req = mockRequest({ booking_id: 1, amount: 5000 });
      const res = mockResponse();

      await paymentController.initiateSslCommerzPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'SSLCommerz is not configured',
      }));
    });
  });
});
