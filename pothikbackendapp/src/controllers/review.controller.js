const { Review } = require('../models');

// Create new review
exports.createReview = async (req, res) => {
  try {
    const { user_id, service_type, service_id, rating, comment } = req.body;

    const review = await Review.create({
      user_id,
      service_type,
      service_id,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Review creation failed',
      details: err.message
    });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll();

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get review by ID
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get reviews by user ID
exports.getReviewsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const reviews = await Review.findAll({
      where: { user_id }
    });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get reviews by service type and service ID
exports.getReviewsByService = async (req, res) => {
  try {
    const { service_type, service_id } = req.params;
    const reviews = await Review.findAll({
      where: { 
        service_type,
        service_id 
      }
    });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    await review.update({ rating, comment });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    await review.destroy();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
