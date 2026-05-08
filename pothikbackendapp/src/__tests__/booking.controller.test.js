/**
 * Unit Tests for Booking Controller
 * ====================================
 * Tests: createBooking, getAllBookings, getBookingById,
 *        getBookingsByUser, updateBookingStatus, deleteBooking
 */

const bookingController = require('../controllers/booking.controller');
const BookingService = require('../services/booking.service');
const { Booking, User, Package } = require('../models');
const { createNotification } = require('../controllers/notification.controller');

jest.mock('../services/booking.service');
jest.mock('../models', () => ({
  Booking: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  User: { name: 'User' },
  Package: { name: 'Package' },
}));
jest.mock('../controllers/notification.controller', () => ({
  createNotification: jest.fn().mockResolvedValue(null),
}));

const mockRequest = (body = {}, params = {}) => ({ body, params });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Booking Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE BOOKING
  // ─────────────────────────────────────────────────────────────────────────
  describe('createBooking', () => {
    it('should create booking and send notification', async () => {
      const booking = { booking_id: 1, user_id: 5, status: 'pending' };
      BookingService.createBooking.mockResolvedValue(booking);

      const req = mockRequest({ user_id: 5, package_id: 1, total_price: 5000 });
      const res = mockResponse();

      await bookingController.createBooking(req, res);

      expect(BookingService.createBooking).toHaveBeenCalledWith(req.body);
      expect(createNotification).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 5,
        type: 'booking',
        title: 'Booking Created',
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: booking,
      }));
    });

    it('should return 500 on error', async () => {
      BookingService.createBooking.mockRejectedValue(new Error('Service error'));

      const req = mockRequest({});
      const res = mockResponse();

      await bookingController.createBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Service error' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL BOOKINGS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllBookings', () => {
    it('should return all bookings with user and package info', async () => {
      const bookings = [{ booking_id: 1 }, { booking_id: 2 }];
      Booking.findAll.mockResolvedValue(bookings);

      const req = mockRequest();
      const res = mockResponse();

      await bookingController.getAllBookings(req, res);

      expect(Booking.findAll).toHaveBeenCalledWith(expect.objectContaining({
        include: expect.any(Array),
        order: [['created_at', 'DESC']],
      }));
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: bookings });
    });

    it('should return 500 on error', async () => {
      Booking.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await bookingController.getAllBookings(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET BOOKING BY ID
  // ─────────────────────────────────────────────────────────────────────────
  describe('getBookingById', () => {
    it('should return booking by id', async () => {
      const booking = { booking_id: 1 };
      Booking.findByPk.mockResolvedValue(booking);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await bookingController.getBookingById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: booking });
    });

    it('should return 404 if booking not found', async () => {
      Booking.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await bookingController.getBookingById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Booking not found' });
    });

    it('should return 500 on error', async () => {
      Booking.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await bookingController.getBookingById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET BOOKINGS BY USER
  // ─────────────────────────────────────────────────────────────────────────
  describe('getBookingsByUser', () => {
    it('should return bookings for a user', async () => {
      const bookings = [{ booking_id: 1 }];
      Booking.findAll.mockResolvedValue(bookings);

      const req = mockRequest({}, { user_id: 5 });
      const res = mockResponse();

      await bookingController.getBookingsByUser(req, res);

      expect(Booking.findAll).toHaveBeenCalledWith({ where: { user_id: 5 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 1, data: bookings });
    });

    it('should return 500 on error', async () => {
      Booking.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { user_id: 5 });
      const res = mockResponse();

      await bookingController.getBookingsByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE BOOKING STATUS
  // ─────────────────────────────────────────────────────────────────────────
  describe('updateBookingStatus', () => {
    it('should update booking status and notify user', async () => {
      const booking = {
        booking_id: 1,
        user_id: 5,
        update: jest.fn().mockResolvedValue(true),
      };
      Booking.findByPk.mockResolvedValue(booking);

      const req = mockRequest({ status: 'confirmed' }, { id: 1 });
      const res = mockResponse();

      await bookingController.updateBookingStatus(req, res);

      expect(booking.update).toHaveBeenCalledWith({ status: 'confirmed' });
      expect(createNotification).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 5,
        type: 'booking',
        title: 'Booking Status Updated',
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 404 if booking not found', async () => {
      Booking.findByPk.mockResolvedValue(null);

      const req = mockRequest({ status: 'confirmed' }, { id: 999 });
      const res = mockResponse();

      await bookingController.updateBookingStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      Booking.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({ status: 'confirmed' }, { id: 1 });
      const res = mockResponse();

      await bookingController.updateBookingStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE BOOKING
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteBooking', () => {
    it('should delete booking successfully', async () => {
      const booking = { booking_id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Booking.findByPk.mockResolvedValue(booking);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await bookingController.deleteBooking(req, res);

      expect(booking.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Booking deleted' });
    });

    it('should return 404 if booking not found', async () => {
      Booking.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await bookingController.deleteBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      Booking.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await bookingController.deleteBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
