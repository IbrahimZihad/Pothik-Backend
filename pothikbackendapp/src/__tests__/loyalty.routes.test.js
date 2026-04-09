const request = require('supertest');
const express = require('express');

// Mock middleware
jest.mock('../middleware/auth.middleware', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    req.user = { id: 'user-123' };
    next();
  }),
}));

// Mock controller
jest.mock('../controllers/loyalty.controller', () => ({
  getUserBalance: jest.fn((req, res) =>
    res.status(200).json({ balance: 100 })
  ),
  addPoints: jest.fn((req, res) =>
    res.status(200).json({ message: 'Points added' })
  ),
  deductPoints: jest.fn((req, res) =>
    res.status(200).json({ message: 'Points deducted' })
  ),
  getAllHistory: jest.fn((req, res) =>
    res.status(200).json({ history: [] })
  ),
  getUserHistory: jest.fn((req, res) =>
    res.status(200).json({ history: [] })
  ),
  deleteLog: jest.fn((req, res) =>
    res.status(200).json({ message: 'Log deleted' })
  ),
}));

const routes = require('../routes/loyalty.routes');
const controller = require('../controllers/loyalty.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const app = express();
app.use(express.json());
app.use('/loyalty', routes);

describe('Loyalty Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Get Balance ─────────────────────────────────────────────
  describe('GET /loyalty/balance/:user_id', () => {
    it('should return user balance', async () => {
      const res = await request(app).get('/loyalty/balance/user-123');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('balance');
      expect(authMiddleware).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if unauthorized', async () => {
      authMiddleware.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Unauthorized' })
      );

      const res = await request(app).get('/loyalty/balance/user-123');
      expect(res.statusCode).toBe(401);
      expect(controller.getUserBalance).not.toHaveBeenCalled();
    });
  });

  // ─── Add Points ──────────────────────────────────────────────
  describe('POST /loyalty/add', () => {
    it('should add points', async () => {
      const res = await request(app)
        .post('/loyalty/add')
        .send({ user_id: 'user-123', points: 50 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Points added' });
    });

    it('should return 401 if unauthorized', async () => {
      authMiddleware.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Unauthorized' })
      );

      const res = await request(app).post('/loyalty/add').send({});
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── Deduct Points ───────────────────────────────────────────
  describe('POST /loyalty/deduct', () => {
    it('should deduct points', async () => {
      const res = await request(app)
        .post('/loyalty/deduct')
        .send({ user_id: 'user-123', points: 20 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Points deducted' });
    });
  });

  // ─── Get All History ─────────────────────────────────────────
  describe('GET /loyalty', () => {
    it('should return all history', async () => {
      const res = await request(app).get('/loyalty');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('history');
    });
  });

  // ─── Get User History ────────────────────────────────────────
  describe('GET /loyalty/user/:user_id', () => {
    it('should return user history', async () => {
      const res = await request(app).get('/loyalty/user/user-123');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('history');
    });

    it('should return 404 if not found', async () => {
      controller.getUserHistory.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'No history found' })
      );

      const res = await request(app).get('/loyalty/user/bad-id');
      expect(res.statusCode).toBe(404);
    });
  });

  // ─── Delete Log ──────────────────────────────────────────────
  describe('DELETE /loyalty/:id', () => {
    it('should delete a log', async () => {
      const res = await request(app).delete('/loyalty/log-1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Log deleted' });
    });

    it('should return 404 if log not found', async () => {
      controller.deleteLog.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'Log not found' })
      );

      const res = await request(app).delete('/loyalty/bad-id');
      expect(res.statusCode).toBe(404);
    });
  });
});