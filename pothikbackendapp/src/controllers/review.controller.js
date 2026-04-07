const { Review, User } = require('../models');

// Create new review
exports.createReview = async (req, res) => {
  try {
    const { user_id, rating, comment } = req.body;

    const review = await Review.create({
      user_id,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Review creation failed',
      details: err.message,
    });
  }
};

// Get all reviews with user full name
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: User,
          as: 'user', // MUST match Review.belongsTo(User, { as: 'user' })
          attributes: ['user_id', 'full_name'],
        },
      ],
      order: [['created_at', 'DESC']], // match your column name
    });

    const formatted = reviews.map(r => ({
      review_id: r.id || r.review_id,
      user_id: r.user_id,
      user_name: r.user ? r.user.full_name : 'Unknown User',
      rating: r.rating,
      comment: r.comment,
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get review by ID with user full name
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'full_name'],
        },
      ],
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    res.json({
      success: true,
      data: {
        review_id: review.id || review.review_id,
        user_id: review.user_id,
        user_name: review.user ? review.user.full_name : 'Unknown User',
        rating: review.rating,
        comment: review.comment,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get reviews by user ID
exports.getReviewsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const reviews = await Review.findAll({
      where: { user_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'full_name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const formatted = reviews.map(r => ({
      review_id: r.id || r.review_id,
      user_id: r.user_id,
      user_name: r.user ? r.user.full_name : 'Unknown User',
      rating: r.rating,
      comment: r.comment,
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
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
        error: 'Review not found',
      });
    }

    await review.update({ rating, comment });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
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
        error: 'Review not found',
      });
    }

    await review.destroy();

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};