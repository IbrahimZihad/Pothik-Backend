/**
 * Unit Tests for Loyalty Controller
 * ====================================
 * Tests: addPoints, deductPoints, getAllHistory,
 *        getUserHistory, deleteLog, getUserBalance
 */

const loyaltyController = require('../controllers/loyalty.controller');
const { LoyaltyHistory, User } = require('../models');

jest.mock('../models', () => ({
  LoyaltyHistory: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
}));

const mockRequest = (body = {}, params = {}) => ({ body, params });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Loyalty Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ADD POINTS
  // ─────────────────────────────────────────────────────────────────────────
  describe('addPoints', () => {
    it('should add loyalty points and return 201', async () => {
      const user = { user_id: 1, loyalty_points: 50, save: jest.fn().mockResolvedValue(true) };
      User.findByPk.mockResolvedValue(user);
      LoyaltyHistory.create.mockResolvedValue({});

      const req = mockRequest({ user_id: 1, points: 30, description: 'Bonus' });
      const res = mockResponse();

      await loyaltyController.addPoints(req, res);

      expect(user.loyalty_points).toBe(80);
      expect(user.save).toHaveBeenCalled();
      expect(LoyaltyHistory.create).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 1,
        points_added: 30,
        description: 'Bonus',
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        current_balance: 80,
      }));
    });

    it('should use default description', async () => {
      const user = { user_id: 1, loyalty_points: 0, save: jest.fn().mockResolvedValue(true) };
      User.findByPk.mockResolvedValue(user);
      LoyaltyHistory.create.mockResolvedValue({});

      const req = mockRequest({ user_id: 1, points: 10 });
      const res = mockResponse();

      await loyaltyController.addPoints(req, res);

      expect(LoyaltyHistory.create).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Points earned',
      }));
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const req = mockRequest({ user_id: 999, points: 10 });
      const res = mockResponse();

      await loyaltyController.addPoints(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      User.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({ user_id: 1, points: 10 });
      const res = mockResponse();

      await loyaltyController.addPoints(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DEDUCT POINTS
  // ─────────────────────────────────────────────────────────────────────────
  describe('deductPoints', () => {
    it('should deduct loyalty points and return 201', async () => {
      const user = { user_id: 1, loyalty_points: 100, save: jest.fn().mockResolvedValue(true) };
      User.findByPk.mockResolvedValue(user);
      LoyaltyHistory.create.mockResolvedValue({});

      const req = mockRequest({ user_id: 1, points: 30 });
      const res = mockResponse();

      await loyaltyController.deductPoints(req, res);

      expect(user.loyalty_points).toBe(70);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        current_balance: 70,
      }));
    });

    it('should return 400 if not enough points', async () => {
      const user = { user_id: 1, loyalty_points: 10 };
      User.findByPk.mockResolvedValue(user);

      const req = mockRequest({ user_id: 1, points: 50 });
      const res = mockResponse();

      await loyaltyController.deductPoints(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Not enough loyalty points',
      }));
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const req = mockRequest({ user_id: 999, points: 10 });
      const res = mockResponse();

      await loyaltyController.deductPoints(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL HISTORY
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllHistory', () => {
    it('should return all loyalty history', async () => {
      const logs = [{ id: 1 }, { id: 2 }];
      LoyaltyHistory.findAll.mockResolvedValue(logs);

      const req = mockRequest();
      const res = mockResponse();

      await loyaltyController.getAllHistory(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: logs });
    });

    it('should return 500 on error', async () => {
      LoyaltyHistory.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await loyaltyController.getAllHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET USER HISTORY
  // ─────────────────────────────────────────────────────────────────────────
  describe('getUserHistory', () => {
    it('should return history for specific user', async () => {
      const logs = [{ id: 1, user_id: 5 }];
      LoyaltyHistory.findAll.mockResolvedValue(logs);

      const req = mockRequest({}, { user_id: 5 });
      const res = mockResponse();

      await loyaltyController.getUserHistory(req, res);

      expect(LoyaltyHistory.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: 5 },
      }));
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 1, data: logs });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE LOG
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteLog', () => {
    it('should delete log successfully', async () => {
      const log = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      LoyaltyHistory.findByPk.mockResolvedValue(log);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await loyaltyController.deleteLog(req, res);

      expect(log.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Log deleted successfully' });
    });

    it('should return 404 if log not found', async () => {
      LoyaltyHistory.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await loyaltyController.deleteLog(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET USER BALANCE
  // ─────────────────────────────────────────────────────────────────────────
  describe('getUserBalance', () => {
    it('should return user balance with aggregated totals', async () => {
      const user = { user_id: 5, loyalty_points: 100 };
      User.findByPk.mockResolvedValue(user);

      const history = [
        { points_added: 50, points_deducted: 0 },
        { points_added: 80, points_deducted: 0 },
        { points_added: 0, points_deducted: 30 },
      ];
      LoyaltyHistory.findAll.mockResolvedValue(history);

      const req = mockRequest({}, { user_id: 5 });
      const res = mockResponse();

      await loyaltyController.getUserBalance(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user_id: 5,
          current_balance: 100,
          total_earned: 130,
          total_spent: 30,
        },
      });
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { user_id: 999 });
      const res = mockResponse();

      await loyaltyController.getUserBalance(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      User.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { user_id: 1 });
      const res = mockResponse();

      await loyaltyController.getUserBalance(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
