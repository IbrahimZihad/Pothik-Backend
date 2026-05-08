/**
 * Unit Tests for Coupon Controller
 * ==================================
 * Tests: createCoupon, getAllCoupons, getCouponById, getCouponByCode,
 *        updateCoupon, deleteCoupon, toggleCouponStatus
 */

const couponController = require('../controllers/coupon.controller');
const { Coupon } = require('../models');

jest.mock('../models', () => ({
  Coupon: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
}));

const mockRequest = (body = {}, params = {}) => ({ body, params });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Coupon Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE COUPON
  // ─────────────────────────────────────────────────────────────────────────
  describe('createCoupon', () => {
    it('should create coupon and return 201', async () => {
      Coupon.findOne.mockResolvedValue(null); // no duplicate
      const coupon = { coupon_id: 1, code: 'SAVE20' };
      Coupon.create.mockResolvedValue(coupon);

      const req = mockRequest({
        code: 'SAVE20',
        discount_type: 'percent',
        discount_value: 20,
        valid_from: '2025-01-01',
        valid_to: '2025-12-31',
        usage_limit: 100,
      });
      const res = mockResponse();

      await couponController.createCoupon(req, res);

      expect(Coupon.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, coupon });
    });

    it('should return 400 if coupon code already exists', async () => {
      Coupon.findOne.mockResolvedValue({ coupon_id: 1, code: 'SAVE20' });

      const req = mockRequest({ code: 'SAVE20' });
      const res = mockResponse();

      await couponController.createCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Coupon code already exists' });
    });

    it('should return 500 on error', async () => {
      Coupon.findOne.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({ code: 'X' });
      const res = mockResponse();

      await couponController.createCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL COUPONS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllCoupons', () => {
    it('should return all coupons', async () => {
      const coupons = [{ coupon_id: 1 }, { coupon_id: 2 }];
      Coupon.findAll.mockResolvedValue(coupons);

      const req = mockRequest();
      const res = mockResponse();

      await couponController.getAllCoupons(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, coupons });
    });

    it('should return 500 on error', async () => {
      Coupon.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await couponController.getAllCoupons(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET COUPON BY ID
  // ─────────────────────────────────────────────────────────────────────────
  describe('getCouponById', () => {
    it('should return coupon by id', async () => {
      const coupon = { coupon_id: 1, code: 'SAVE20' };
      Coupon.findByPk.mockResolvedValue(coupon);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await couponController.getCouponById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, coupon });
    });

    it('should return 404 if not found', async () => {
      Coupon.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await couponController.getCouponById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET COUPON BY CODE
  // ─────────────────────────────────────────────────────────────────────────
  describe('getCouponByCode', () => {
    it('should return valid active coupon by code', async () => {
      const coupon = { coupon_id: 1, code: 'SAVE20', is_active: true };
      Coupon.findOne.mockResolvedValue(coupon);

      const req = mockRequest({}, { code: 'SAVE20' });
      const res = mockResponse();

      await couponController.getCouponByCode(req, res);

      expect(Coupon.findOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, coupon });
    });

    it('should return 404 for invalid/expired coupon', async () => {
      Coupon.findOne.mockResolvedValue(null);

      const req = mockRequest({}, { code: 'EXPIRED' });
      const res = mockResponse();

      await couponController.getCouponByCode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid or expired coupon code' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE COUPON
  // ─────────────────────────────────────────────────────────────────────────
  describe('updateCoupon', () => {
    it('should update coupon successfully', async () => {
      const coupon = { coupon_id: 1, update: jest.fn().mockResolvedValue(true) };
      Coupon.findByPk.mockResolvedValue(coupon);

      const req = mockRequest({ discount_value: 30 }, { id: 1 });
      const res = mockResponse();

      await couponController.updateCoupon(req, res);

      expect(coupon.update).toHaveBeenCalledWith({ discount_value: 30 });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 404 if coupon not found', async () => {
      Coupon.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await couponController.updateCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE COUPON
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteCoupon', () => {
    it('should delete coupon successfully', async () => {
      const coupon = { coupon_id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Coupon.findByPk.mockResolvedValue(coupon);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await couponController.deleteCoupon(req, res);

      expect(coupon.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Coupon deleted successfully' });
    });

    it('should return 404 if coupon not found', async () => {
      Coupon.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await couponController.deleteCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TOGGLE COUPON STATUS
  // ─────────────────────────────────────────────────────────────────────────
  describe('toggleCouponStatus', () => {
    it('should toggle coupon from active to inactive', async () => {
      const coupon = { coupon_id: 1, is_active: true, save: jest.fn().mockResolvedValue(true) };
      Coupon.findByPk.mockResolvedValue(coupon);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await couponController.toggleCouponStatus(req, res);

      expect(coupon.is_active).toBe(false);
      expect(coupon.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Coupon is now inactive',
      }));
    });

    it('should toggle coupon from inactive to active', async () => {
      const coupon = { coupon_id: 1, is_active: false, save: jest.fn().mockResolvedValue(true) };
      Coupon.findByPk.mockResolvedValue(coupon);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await couponController.toggleCouponStatus(req, res);

      expect(coupon.is_active).toBe(true);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Coupon is now active',
      }));
    });

    it('should return 404 if coupon not found', async () => {
      Coupon.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await couponController.toggleCouponStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
