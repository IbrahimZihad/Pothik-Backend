const request = require('supertest');
const express = require('express');

// Mock auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authMiddleware: jest.fn((req, res, next) => next()),
}));

// Mock controller
jest.mock('../controllers/review.controller', () => ({
  getAllReviews: jest.fn((req, res) =>
    res.status(200).json({ reviews: [] })
  ),
  getReviewById: jest.fn((req, res) =>
    res.status(200).json({ review: { id: req.params.id } })
  ),
  getReviewsByUser: jest.fn((req, res) =>
    res.status(200).json({ reviews: [], userId: req.params.user_id })
  ),
  createReview: jest.fn((req, res) =>
    res.status(201).json({ message: 'Review created', review: req.body })
  ),
  updateReview: jest.fn((req, res) =>
    res.status(200).json({ message: 'Review updated', review: { id: req.params.id, ...req.body } })
  ),
  deleteReview: jest.fn((req, res) =>
    res.status(200).json({ message: 'Review deleted', id: req.params.id })
  ),
}));

const routes = require('../routes/review.routes');
const controller = require('../controllers/review.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const app = express();
app.use(express.json());
app.use('/reviews', routes);

describe('Review Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Get All Reviews ──────────────────────────────────────────
  describe('GET /reviews', () => {
    it('should return all reviews', async () => {
      const res = await request(app).get('/reviews');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('reviews');
      expect(Array.isArray(res.body.reviews)).toBe(true);
      expect(controller.getAllReviews).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get Review By ID ─────────────────────────────────────────
  describe('GET /reviews/:id', () => {
    it('should return a review by ID', async () => {
      const res = await request(app).get('/reviews/review-123');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('review');
      expect(res.body.review).toHaveProperty('id', 'review-123');
      expect(controller.getReviewById).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get Reviews By User ──────────────────────────────────────
  describe('GET /reviews/user/:user_id', () => {
    it('should return reviews for a user', async () => {
      const res = await request(app).get('/reviews/user/user-123');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('reviews');
      expect(res.body).toHaveProperty('userId', 'user-123');
      expect(controller.getReviewsByUser).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Create Review (Protected) ────────────────────────────────
  describe('POST /reviews', () => {
    it('should create a review when authenticated', async () => {
      const reviewData = { rating: 5, comment: 'Amazing experience!' };
      const res = await request(app)
        .post('/reviews')
        .send(reviewData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Review created');
      expect(res.body).toHaveProperty('review');
      expect(authMiddleware).toHaveBeenCalledTimes(1);
      expect(controller.createReview).toHaveBeenCalledTimes(1);
    });

    it('should block unauthenticated requests', async () => {
      authMiddleware.mockImplementationOnce((req, res) =>
        res.status(401).json({ message: 'Unauthorized' })
      );

      const res = await request(app)
        .post('/reviews')
        .send({ rating: 5, comment: 'Amazing experience!' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Unauthorized');
      expect(controller.createReview).not.toHaveBeenCalled();
    });
  });

  // ─── Update Review (Protected) ────────────────────────────────
  describe('PUT /reviews/:id', () => {
    it('should update a review when authenticated', async () => {
      const updateData = { rating: 4, comment: 'Great experience!' };
      const res = await request(app)
        .put('/reviews/review-123')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Review updated');
      expect(res.body.review).toHaveProperty('id', 'review-123');
      expect(authMiddleware).toHaveBeenCalledTimes(1);
      expect(controller.updateReview).toHaveBeenCalledTimes(1);
    });

    it('should block unauthenticated requests', async () => {
      authMiddleware.mockImplementationOnce((req, res) =>
        res.status(401).json({ message: 'Unauthorized' })
      );

      const res = await request(app)
        .put('/reviews/review-123')
        .send({ rating: 4 });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Unauthorized');
      expect(controller.updateReview).not.toHaveBeenCalled();
    });
  });

  // ─── Delete Review (Protected) ────────────────────────────────
  describe('DELETE /reviews/:id', () => {
    it('should delete a review when authenticated', async () => {
      const res = await request(app).delete('/reviews/review-123');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Review deleted');
      expect(res.body).toHaveProperty('id', 'review-123');
      expect(authMiddleware).toHaveBeenCalledTimes(1);
      expect(controller.deleteReview).toHaveBeenCalledTimes(1);
    });

    it('should block unauthenticated requests', async () => {
      authMiddleware.mockImplementationOnce((req, res) =>
        res.status(401).json({ message: 'Unauthorized' })
      );

      const res = await request(app).delete('/reviews/review-123');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Unauthorized');
      expect(controller.deleteReview).not.toHaveBeenCalled();
    });
  });
});