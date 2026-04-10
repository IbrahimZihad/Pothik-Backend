/**
 * Unit Tests for Review Controller
 * ===================================
 * Tests: createReview, getAllReviews, getReviewById,
 *        getReviewsByUser, getReviewsByService, updateReview, deleteReview
 */

const reviewController = require('../controllers/review.controller');
const { Review } = require('../models');

jest.mock('../models', () => ({
  Review: {
    create: jest.fn(),
    findAll: jest.fn(),
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

describe('Review Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE REVIEW
  // ─────────────────────────────────────────────────────────────────────────
  describe('createReview', () => {
    it('should create review and return 201', async () => {
      const review = { review_id: 1, rating: 5, comment: 'Great!' };
      Review.create.mockResolvedValue(review);

      const req = mockRequest({
        user_id: 1,
        service_type: 'hotel',
        service_id: 2,
        rating: 5,
        comment: 'Great!',
      });
      const res = mockResponse();

      await reviewController.createReview(req, res);

      expect(Review.create).toHaveBeenCalledWith({
        user_id: 1,
        service_type: 'hotel',
        service_id: 2,
        rating: 5,
        comment: 'Great!',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: review,
      }));
    });

    it('should return 500 on error', async () => {
      Review.create.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({});
      const res = mockResponse();

      await reviewController.createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL REVIEWS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllReviews', () => {
    it('should return all reviews', async () => {
      const reviews = [{ review_id: 1 }, { review_id: 2 }];
      Review.findAll.mockResolvedValue(reviews);

      const req = mockRequest();
      const res = mockResponse();

      await reviewController.getAllReviews(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: reviews });
    });

    it('should return 500 on error', async () => {
      Review.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await reviewController.getAllReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET REVIEW BY ID
  // ─────────────────────────────────────────────────────────────────────────
  describe('getReviewById', () => {
    it('should return review by id', async () => {
      const review = { review_id: 1 };
      Review.findByPk.mockResolvedValue(review);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await reviewController.getReviewById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: review });
    });

    it('should return 404 if not found', async () => {
      Review.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await reviewController.getReviewById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET REVIEWS BY USER
  // ─────────────────────────────────────────────────────────────────────────
  describe('getReviewsByUser', () => {
    it('should return reviews for a user', async () => {
      const reviews = [{ review_id: 1 }];
      Review.findAll.mockResolvedValue(reviews);

      const req = mockRequest({}, { user_id: 5 });
      const res = mockResponse();

      await reviewController.getReviewsByUser(req, res);

      expect(Review.findAll).toHaveBeenCalledWith({ where: { user_id: 5 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 1, data: reviews });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET REVIEWS BY SERVICE
  // ─────────────────────────────────────────────────────────────────────────
  describe('getReviewsByService', () => {
    it('should return reviews for a service', async () => {
      const reviews = [{ review_id: 1 }];
      Review.findAll.mockResolvedValue(reviews);

      const req = mockRequest({}, { service_type: 'hotel', service_id: 2 });
      const res = mockResponse();

      await reviewController.getReviewsByService(req, res);

      expect(Review.findAll).toHaveBeenCalledWith({
        where: { service_type: 'hotel', service_id: 2 },
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 1, data: reviews });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE REVIEW
  // ─────────────────────────────────────────────────────────────────────────
  describe('updateReview', () => {
    it('should update review successfully', async () => {
      const review = { review_id: 1, update: jest.fn().mockResolvedValue(true) };
      Review.findByPk.mockResolvedValue(review);

      const req = mockRequest({ rating: 4, comment: 'Updated' }, { id: 1 });
      const res = mockResponse();

      await reviewController.updateReview(req, res);

      expect(review.update).toHaveBeenCalledWith({ rating: 4, comment: 'Updated' });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 404 if not found', async () => {
      Review.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await reviewController.updateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE REVIEW
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteReview', () => {
    it('should delete review successfully', async () => {
      const review = { review_id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Review.findByPk.mockResolvedValue(review);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await reviewController.deleteReview(req, res);

      expect(review.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Review deleted successfully' });
    });

    it('should return 404 if not found', async () => {
      Review.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await reviewController.deleteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
