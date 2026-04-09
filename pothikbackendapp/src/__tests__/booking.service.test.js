// src/__tests__/booking.service.test.js

// ---------- Mocks ----------
jest.mock('../models', () => ({
  Booking: {
    create: jest.fn(),
  },
  Coupon: {
    findOne: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
  LoyaltyHistory: {
    create: jest.fn(),
  },
}));

jest.mock('sequelize', () => {
  const actual = jest.requireActual('sequelize');
  return {
    ...actual,
    Op: actual.Op,
    Sequelize: {
      col: jest.fn((col) => col),
    },
  };
});

const { Booking, Coupon, User, LoyaltyHistory } = require('../models');
const BookingService = require('../services/booking.service');

// ---------- Helpers ----------
function mockUser(overrides = {}) {
  return {
    user_id: 1,
    loyalty_points: 200,
    save: jest.fn(),
    ...overrides,
  };
}

function mockCoupon(overrides = {}) {
  return {
    coupon_id: 10,
    code: 'SAVE10',
    is_active: true,
    discount_type: 'fixed',
    discount_value: 100,
    max_discount: null,
    used_count: 0,
    save: jest.fn(),
    ...overrides,
  };
}

describe('BookingService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- applyCoupon ----------
  describe('applyCoupon()', () => {
    it('should return zero discount if no coupon code provided', async () => {
      const result = await BookingService.applyCoupon(null, 1000);

      expect(result).toEqual({ discount: 0, coupon: null });
      expect(Coupon.findOne).not.toHaveBeenCalled();
    });

    it('should throw if coupon is invalid or expired', async () => {
      Coupon.findOne.mockResolvedValueOnce(null);

      await expect(BookingService.applyCoupon('BADCODE', 1000))
        .rejects.toThrow('Invalid or expired coupon');
    });

    it('should apply fixed discount correctly', async () => {
      Coupon.findOne.mockResolvedValueOnce(mockCoupon({ discount_type: 'fixed', discount_value: 100 }));

      const result = await BookingService.applyCoupon('SAVE10', 1000);

      expect(result.discount).toBe(100);
      expect(result.coupon.code).toBe('SAVE10');
    });

    it('should apply percent discount correctly', async () => {
      Coupon.findOne.mockResolvedValueOnce(mockCoupon({ discount_type: 'percent', discount_value: 10 }));

      const result = await BookingService.applyCoupon('SAVE10', 1000);

      expect(result.discount).toBe(100); // 10% of 1000
    });

    it('should cap percent discount at max_discount', async () => {
      Coupon.findOne.mockResolvedValueOnce(mockCoupon({
        discount_type: 'percent',
        discount_value: 50,
        max_discount: 200,
      }));

      const result = await BookingService.applyCoupon('SAVE50', 1000);

      expect(result.discount).toBe(200); // 50% of 1000 = 500, capped at 200
    });

    it('should not cap fixed discount if it is below max_discount', async () => {
      Coupon.findOne.mockResolvedValueOnce(mockCoupon({
        discount_type: 'fixed',
        discount_value: 100,
        max_discount: 500,
      }));

      const result = await BookingService.applyCoupon('SAVE10', 1000);

      expect(result.discount).toBe(100);
    });
  });

  // ---------- useLoyaltyPoints ----------
  describe('useLoyaltyPoints()', () => {
    it('should return zero deducted if no points requested', async () => {
      const user = mockUser();

      const result = await BookingService.useLoyaltyPoints(user, 0);

      expect(result).toEqual({ deducted: 0 });
      expect(user.save).not.toHaveBeenCalled();
      expect(LoyaltyHistory.create).not.toHaveBeenCalled();
    });

    it('should return zero deducted if pointsRequested is null', async () => {
      const user = mockUser();

      const result = await BookingService.useLoyaltyPoints(user, null);

      expect(result).toEqual({ deducted: 0 });
    });

    it('should throw if user does not have enough loyalty points', async () => {
      const user = mockUser({ loyalty_points: 50 });

      await expect(BookingService.useLoyaltyPoints(user, 100))
        .rejects.toThrow('Not enough loyalty points');

      expect(user.save).not.toHaveBeenCalled();
    });

    it('should deduct points and save user', async () => {
      const user = mockUser({ loyalty_points: 200 });
      LoyaltyHistory.create.mockResolvedValueOnce({});

      const result = await BookingService.useLoyaltyPoints(user, 100);

      expect(result).toEqual({ deducted: 100 });
      expect(user.loyalty_points).toBe(100);
      expect(user.save).toHaveBeenCalledTimes(1);
    });

    it('should create a loyalty history record on deduction', async () => {
      const user = mockUser({ loyalty_points: 200 });
      LoyaltyHistory.create.mockResolvedValueOnce({});

      await BookingService.useLoyaltyPoints(user, 100);

      expect(LoyaltyHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: user.user_id,
          points_deducted: 100,
          description: 'Used for booking discount',
        })
      );
    });
  });

  // ---------- earnLoyaltyPoints ----------
  describe('earnLoyaltyPoints()', () => {
    it('should earn 1 point per 100 taka paid', async () => {
      const user = mockUser({ loyalty_points: 100 });
      LoyaltyHistory.create.mockResolvedValueOnce({});

      const earned = await BookingService.earnLoyaltyPoints(user, 500);

      expect(earned).toBe(5);
      expect(user.loyalty_points).toBe(105);
      expect(user.save).toHaveBeenCalledTimes(1);
    });

    it('should earn 0 points for amount less than 100', async () => {
      const user = mockUser({ loyalty_points: 100 });
      LoyaltyHistory.create.mockResolvedValueOnce({});

      const earned = await BookingService.earnLoyaltyPoints(user, 50);

      expect(earned).toBe(0);
      expect(user.loyalty_points).toBe(100);
    });

    it('should floor the earned points (no decimals)', async () => {
      const user = mockUser({ loyalty_points: 100 });
      LoyaltyHistory.create.mockResolvedValueOnce({});

      const earned = await BookingService.earnLoyaltyPoints(user, 750);

      expect(earned).toBe(7); // floor(750/100)
    });

    it('should create a loyalty history record on earning', async () => {
      const user = mockUser({ loyalty_points: 100 });
      LoyaltyHistory.create.mockResolvedValueOnce({});

      await BookingService.earnLoyaltyPoints(user, 500);

      expect(LoyaltyHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: user.user_id,
          points_added: 5,
          description: 'Earned from booking',
        })
      );
    });
  });

  // ---------- createBooking ----------
  describe('createBooking()', () => {
    const bookingData = {
      user_id: 1,
      package_type: 'tour',
      package_id: 5,
      session_id: 3,
      total_price: 1000,
      coupon_code: null,
      loyalty_points_used: 0,
    };

    const mockBookingResult = {
      booking_id: 101,
      user_id: 1,
      status: 'pending',
    };

    it('should create a booking with no coupon and no loyalty points', async () => {
      const user = mockUser();
      User.findByPk.mockResolvedValueOnce(user);
      LoyaltyHistory.create.mockResolvedValue({});
      Booking.create.mockResolvedValueOnce(mockBookingResult);

      const result = await BookingService.createBooking(bookingData);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Booking.create).toHaveBeenCalledTimes(1);
      expect(Booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 1,
          total_price: 1000,
          coupon_discount: 0,
          loyalty_points_used: 0,
          status: 'pending',
        })
      );
      expect(result).toEqual(mockBookingResult);
    });

    it('should throw if user not found', async () => {
      User.findByPk.mockResolvedValueOnce(null);

      await expect(BookingService.createBooking(bookingData))
        .rejects.toThrow('User not found');

      expect(Booking.create).not.toHaveBeenCalled();
    });

    it('should apply coupon discount to final price', async () => {
      const user = mockUser();
      const coupon = mockCoupon({ discount_type: 'fixed', discount_value: 200 });

      User.findByPk.mockResolvedValueOnce(user);
      Coupon.findOne.mockResolvedValueOnce(coupon);
      LoyaltyHistory.create.mockResolvedValue({});
      Booking.create.mockResolvedValueOnce(mockBookingResult);

      await BookingService.createBooking({ ...bookingData, coupon_code: 'SAVE10' });

      expect(Booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          coupon_discount: 200,
          discounted_price: 800, // 1000 - 200
        })
      );
      expect(coupon.save).toHaveBeenCalledTimes(1); // used_count incremented
    });

    it('should deduct loyalty points from final price', async () => {
      const user = mockUser({ loyalty_points: 200 });

      User.findByPk.mockResolvedValueOnce(user);
      LoyaltyHistory.create.mockResolvedValue({});
      Booking.create.mockResolvedValueOnce(mockBookingResult);

      await BookingService.createBooking({ ...bookingData, loyalty_points_used: 100 });

      expect(Booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          loyalty_points_used: 100,
          discounted_price: 900, // 1000 - 100
        })
      );
    });

    it('should cap loyalty points to price after coupon', async () => {
      const user = mockUser({ loyalty_points: 500 });
      const coupon = mockCoupon({ discount_type: 'fixed', discount_value: 700 });

      User.findByPk.mockResolvedValueOnce(user);
      Coupon.findOne.mockResolvedValueOnce(coupon);
      LoyaltyHistory.create.mockResolvedValue({});
      Booking.create.mockResolvedValueOnce(mockBookingResult);

      // total = 1000, after coupon = 300, loyalty requested = 500 → capped to 300
      await BookingService.createBooking({
        ...bookingData,
        coupon_code: 'SAVE70',
        loyalty_points_used: 500,
      });

      expect(Booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          loyalty_points_used: 300, // capped
          discounted_price: 0,      // 300 - 300
        })
      );
    });

    it('should never produce a negative final price', async () => {
      const user = mockUser({ loyalty_points: 2000 });

      User.findByPk.mockResolvedValueOnce(user);
      LoyaltyHistory.create.mockResolvedValue({});
      Booking.create.mockResolvedValueOnce(mockBookingResult);

      await BookingService.createBooking({ ...bookingData, loyalty_points_used: 2000 });

      expect(Booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discounted_price: 0, // never negative
        })
      );
    });

    it('should earn loyalty points based on amount paid', async () => {
      const user = mockUser({ loyalty_points: 0 });

      User.findByPk.mockResolvedValueOnce(user);
      LoyaltyHistory.create.mockResolvedValue({});
      Booking.create.mockResolvedValueOnce(mockBookingResult);

      // 1000 taka paid → 10 points earned
      await BookingService.createBooking(bookingData);

      expect(Booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          loyalty_points_earned: 10,
        })
      );
    });

    it('should increment coupon used_count on successful booking', async () => {
      const user = mockUser();
      const coupon = mockCoupon();

      User.findByPk.mockResolvedValueOnce(user);
      Coupon.findOne.mockResolvedValueOnce(coupon);
      LoyaltyHistory.create.mockResolvedValue({});
      Booking.create.mockResolvedValueOnce(mockBookingResult);

      await BookingService.createBooking({ ...bookingData, coupon_code: 'SAVE10' });

      expect(coupon.used_count).toBe(1);
      expect(coupon.save).toHaveBeenCalledTimes(1);
    });

    it('should set coupon_id to null when no coupon is used', async () => {
      const user = mockUser();

      User.findByPk.mockResolvedValueOnce(user);
      LoyaltyHistory.create.mockResolvedValue({});
      Booking.create.mockResolvedValueOnce(mockBookingResult);

      await BookingService.createBooking(bookingData);

      expect(Booking.create).toHaveBeenCalledWith(
        expect.objectContaining({ coupon_id: null })
      );
    });
  });

});