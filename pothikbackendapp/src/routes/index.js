const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');

// API Routes
router.use('/users', userRoutes);

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

module.exports = router;