const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');

// Create review
router.post('/', reviewController.createReview);

// Get all reviews
router.get('/', reviewController.getAllReviews);

// Get review by ID
router.get('/:id', reviewController.getReviewById);

// Get reviews by user ID
router.get('/user/:user_id', reviewController.getReviewsByUser);

// Get reviews by service
router.get('/service/:service_type/:service_id', reviewController.getReviewsByService);

// Update review
router.put('/:id', reviewController.updateReview);

// Delete review
router.delete('/:id', reviewController.deleteReview);

module.exports = router;