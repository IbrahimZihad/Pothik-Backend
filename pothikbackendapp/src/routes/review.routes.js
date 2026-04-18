const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/review.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// -----------------------------
// 🔹 Public Routes
// -----------------------------

// Get all reviews
router.get('/', reviewController.getAllReviews);

// Get review by ID
router.get('/:id', reviewController.getReviewById);

// Get reviews by user ID
router.get('/user/:user_id', reviewController.getReviewsByUser);

// -----------------------------
// 🔹 Protected Routes (Require Auth)
// -----------------------------

// Create review
router.post('/', authMiddleware, reviewController.createReview);

// Update review
router.put('/:id', authMiddleware, reviewController.updateReview);

// Delete review
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;