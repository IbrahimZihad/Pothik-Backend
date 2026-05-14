const reviewController = require('../controllers/review.controller');
const { Review } = require('../models');

jest.mock('../models', () => ({
  Review: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  User: {},
}));

const mockRequest = (body = {}, params = {}) => ({ body, params });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Review Controller (Updated Model)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────
  // CREATE REVIEW
  // ─────────────────────────────────────────
  describe('createReview', () => {
    it('should create review successfully', async () => {
      const review = { review_id: 1, user_id: 1, rating: 5, comment: 'Great!' };
      Review.create.mockResolvedValue(review);

      const req = mockRequest({
        user_id: 1,
        rating: 5,
        comment: 'Great!',
      });
      const res = mockResponse();

      await reviewController.createReview(req, res);

      expect(Review.create).toHaveBeenCalledWith({
        user_id: 1,
        rating: 5,
        comment: 'Great!',
      });

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle missing fields', async () => {
      Review.create.mockResolvedValue({});

      const res = mockResponse();
      await reviewController.createReview(mockRequest({}), res);

      expect(res.status).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      Review.create.mockRejectedValue(new Error());

      const res = mockResponse();
      await reviewController.createReview(mockRequest({}), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────
  // GET ALL REVIEWS
  // ─────────────────────────────────────────
  describe('getAllReviews', () => {
    it('should return all reviews', async () => {
      const reviews = [
        { review_id: 1, user_id: 1, rating: 5, comment: 'Great!', user: { full_name: 'Alice' } },
        { review_id: 2, user_id: 2, rating: 4, comment: 'Good!',  user: { full_name: 'Bob' } },
      ];
      Review.findAll.mockResolvedValue(reviews);

      const res = mockResponse();
      await reviewController.getAllReviews(mockRequest(), res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: [
          { review_id: 1, user_id: 1, user_name: 'Alice', rating: 5, comment: 'Great!' },
          { review_id: 2, user_id: 2, user_name: 'Bob',   rating: 4, comment: 'Good!'  },
        ],
      });
    });

    it('should handle empty reviews', async () => {
      Review.findAll.mockResolvedValue([]);

      const res = mockResponse();
      await reviewController.getAllReviews(mockRequest(), res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ count: 0 })
      );
    });

    it('should return 500 on error', async () => {
      Review.findAll.mockRejectedValue(new Error());

      const res = mockResponse();
      await reviewController.getAllReviews(mockRequest(), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────
  // GET REVIEW BY ID
  // ─────────────────────────────────────────
  describe('getReviewById', () => {
    it('should return review', async () => {
      const review = {
        review_id: 1,
        user_id: 1,
        rating: 5,
        comment: 'Great!',
        user: { full_name: 'Alice' },
      };
      Review.findByPk.mockResolvedValue(review);

      const res = mockResponse();
      await reviewController.getReviewById(mockRequest({}, { id: 1 }), res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          review_id: 1,
          user_id: 1,
          user_name: 'Alice',
          rating: 5,
          comment: 'Great!',
        },
      });
    });

    it('should return 404 if not found', async () => {
      Review.findByPk.mockResolvedValue(null);

      const res = mockResponse();
      await reviewController.getReviewById(mockRequest({}, { id: 99 }), res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      Review.findByPk.mockRejectedValue(new Error());

      const res = mockResponse();
      await reviewController.getReviewById(mockRequest({}, { id: 1 }), res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────
  // GET REVIEWS BY USER
  // ─────────────────────────────────────────
  describe('getReviewsByUser', () => {
    it('should return user reviews', async () => {
      const reviews = [
        { review_id: 1, user_id: 1, rating: 5, comment: 'Great!', user: { full_name: 'Alice' } },
      ];
      Review.findAll.mockResolvedValue(reviews);

      const res = mockResponse();
      await reviewController.getReviewsByUser(
        mockRequest({}, { user_id: 1 }),
        res
      );

      expect(Review.findAll).toHaveBeenCalledWith({
        where: { user_id: 1 },
        include: [{ model: {}, as: 'user', attributes: ['user_id', 'full_name'] }],
        order: [['created_at', 'DESC']],
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: [
          { review_id: 1, user_id: 1, user_name: 'Alice', rating: 5, comment: 'Great!' },
        ],
      });
    });

    it('should return 500 on error', async () => {
      Review.findAll.mockRejectedValue(new Error());

      const res = mockResponse();
      await reviewController.getReviewsByUser(
        mockRequest({}, { user_id: 1 }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────
  // UPDATE REVIEW
  // ─────────────────────────────────────────
  describe('updateReview', () => {
    it('should update review', async () => {
      const review = {
        update: jest.fn().mockResolvedValue(true),
      };
      Review.findByPk.mockResolvedValue(review);

      const res = mockResponse();
      await reviewController.updateReview(
        mockRequest({ rating: 4, comment: 'Updated' }, { id: 1 }),
        res
      );

      expect(review.update).toHaveBeenCalledWith({
        rating: 4,
        comment: 'Updated',
      });

      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404', async () => {
      Review.findByPk.mockResolvedValue(null);

      const res = mockResponse();
      await reviewController.updateReview(
        mockRequest({}, { id: 1 }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      Review.findByPk.mockRejectedValue(new Error());

      const res = mockResponse();
      await reviewController.updateReview(
        mockRequest({}, { id: 1 }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────
  // DELETE REVIEW
  // ─────────────────────────────────────────
  describe('deleteReview', () => {
    it('should delete review', async () => {
      const review = {
        destroy: jest.fn().mockResolvedValue(true),
      };
      Review.findByPk.mockResolvedValue(review);

      const res = mockResponse();
      await reviewController.deleteReview(
        mockRequest({}, { id: 1 }),
        res
      );

      expect(review.destroy).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Review deleted successfully',
      });
    });

    it('should return 404', async () => {
      Review.findByPk.mockResolvedValue(null);

      const res = mockResponse();
      await reviewController.deleteReview(
        mockRequest({}, { id: 1 }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      Review.findByPk.mockRejectedValue(new Error());

      const res = mockResponse();
      await reviewController.deleteReview(
        mockRequest({}, { id: 1 }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});