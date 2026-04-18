const request = require('supertest');
const express = require('express');

// Mock the auth controller
jest.mock('../controllers/auth.controller', () => ({
  register: jest.fn((req, res) => res.status(201).json({ message: 'User registered' })),
  login: jest.fn((req, res) => res.status(200).json({ token: 'mock-token' })),
  verifyToken: jest.fn((req, res) => res.status(200).json({ valid: true })),
  googleLogin: jest.fn((req, res) => res.status(200).json({ token: 'google-token' })),
  forgotPassword: jest.fn((req, res) => res.status(200).json({ message: 'OTP sent' })),
  resetPassword: jest.fn((req, res) => res.status(200).json({ message: 'Password reset successful' })),
}));

const authRoutes = require('../routes/auth.routes');
const authController = require('../controllers/auth.controller');

// Build a minimal app for testing
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- POST /auth/register ----------
  describe('POST /auth/register', () => {
    it('should call register controller and return 201', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: 'User registered' });
      expect(authController.register).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if controller sends validation error', async () => {
      authController.register.mockImplementationOnce((req, res) =>
        res.status(400).json({ error: 'Email already exists' })
      );

      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'existing@example.com', password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Email already exists' });
    });
  });

  // ---------- POST /auth/login ----------
  describe('POST /auth/login', () => {
    it('should call login controller and return token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(authController.login).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for invalid credentials', async () => {
      authController.login.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Invalid credentials' })
      );

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' });

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------- GET /auth/verify ----------
  describe('GET /auth/verify', () => {
    it('should call verifyToken controller and return valid true', async () => {
      const res = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer mock-token');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ valid: true });
      expect(authController.verifyToken).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for invalid token', async () => {
      authController.verifyToken.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Invalid token' })
      );

      const res = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer bad-token');

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------- POST /auth/google ----------
  describe('POST /auth/google', () => {
    it('should call googleLogin controller and return token', async () => {
      const res = await request(app)
        .post('/auth/google')
        .send({ idToken: 'google-id-token' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token', 'google-token');
      expect(authController.googleLogin).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for invalid Google token', async () => {
      authController.googleLogin.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Invalid Google token' })
      );

      const res = await request(app)
        .post('/auth/google')
        .send({ idToken: 'invalid' });

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------- POST /auth/forgot-password ----------
  describe('POST /auth/forgot-password', () => {
    it('should call forgotPassword controller and return 200', async () => {
      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'OTP sent' });
      expect(authController.forgotPassword).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if email not found', async () => {
      authController.forgotPassword.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'Email not found' })
      );

      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nobody@example.com' });

      expect(res.statusCode).toBe(404);
    });
  });

  // ---------- POST /auth/reset-password ----------
  describe('POST /auth/reset-password', () => {
    it('should call resetPassword controller and return 200', async () => {
      const res = await request(app)
        .post('/auth/reset-password')
        .send({ email: 'test@example.com', otp: '123456', newPassword: 'newpass123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Password reset successful' });
      expect(authController.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for invalid or expired OTP', async () => {
      authController.resetPassword.mockImplementationOnce((req, res) =>
        res.status(400).json({ error: 'Invalid or expired OTP' })
      );

      const res = await request(app)
        .post('/auth/reset-password')
        .send({ email: 'test@example.com', otp: '000000', newPassword: 'newpass' });

      expect(res.statusCode).toBe(400);
    });
  });

});