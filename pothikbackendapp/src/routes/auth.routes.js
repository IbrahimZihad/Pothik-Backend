const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Verify token
router.get('/verify', authController.verifyToken);

// Google OAuth login
router.post('/google', authController.googleLogin);

module.exports = router;