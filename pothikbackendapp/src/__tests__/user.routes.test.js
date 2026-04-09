const request = require('supertest');
const express = require('express');
const path = require('path');

// Mock auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    req.user = { id: 'user-123', email: 'test@example.com' }; // simulate authenticated user
    next();
  }),
}));

// Mock user controller
jest.mock('../controllers/user.controller', () => ({
  getProfile: jest.fn((req, res) => res.status(200).json({ id: 'user-123', email: 'test@example.com' })),
  uploadProfileImage: jest.fn((req, res) => res.status(200).json({ message: 'Image uploaded' })),
  updateProfile: jest.fn((req, res) => res.status(200).json({ message: 'Profile updated' })),
  updatePassword: jest.fn((req, res) => res.status(200).json({ message: 'Password updated' })),
}));

// Mock multer to avoid real disk writes
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req, res, next) => next(), // always succeed
  });
  multer.diskStorage = () => ({});
  return multer;
});

const userRoutes = require('../routes/user.routes');
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('User Routes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- GET /users/profile ----------
  describe('GET /users/profile', () => {
    it('should return user profile when authenticated', async () => {
      const res = await request(app).get('/users/profile');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ id: 'user-123', email: 'test@example.com' });
      expect(authMiddleware).toHaveBeenCalledTimes(1);
      expect(userController.getProfile).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if not authenticated', async () => {
      authMiddleware.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Unauthorized' })
      );

      const res = await request(app).get('/users/profile');

      expect(res.statusCode).toBe(401);
      expect(userController.getProfile).not.toHaveBeenCalled();
    });
  });

  // ---------- PUT /users/profile/image ----------
  describe('PUT /users/profile/image', () => {
    it('should upload profile image successfully', async () => {
      const res = await request(app)
        .put('/users/profile/image')
        .attach('profile_image', Buffer.from('fake image data'), 'avatar.jpg');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Image uploaded' });
      expect(userController.uploadProfileImage).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if not authenticated', async () => {
      authMiddleware.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Unauthorized' })
      );

      const res = await request(app)
        .put('/users/profile/image')
        .attach('profile_image', Buffer.from('fake image'), 'avatar.jpg');

      expect(res.statusCode).toBe(401);
      expect(userController.uploadProfileImage).not.toHaveBeenCalled();
    });
  });

  // ---------- PUT /users/profile ----------
  describe('PUT /users/profile', () => {
    it('should update profile when authenticated', async () => {
      const res = await request(app)
        .put('/users/profile')
        .send({ name: 'John Doe', bio: 'Developer' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Profile updated' });
      expect(userController.updateProfile).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if not authenticated', async () => {
      authMiddleware.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Unauthorized' })
      );

      const res = await request(app)
        .put('/users/profile')
        .send({ name: 'John' });

      expect(res.statusCode).toBe(401);
    });
  });

  // ---------- PUT /users/password ----------
  describe('PUT /users/password', () => {
    it('should update password when authenticated', async () => {
      const res = await request(app)
        .put('/users/password')
        .send({ currentPassword: 'old123', newPassword: 'new456' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Password updated' });
      expect(userController.updatePassword).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for wrong current password', async () => {
      userController.updatePassword.mockImplementationOnce((req, res) =>
        res.status(400).json({ error: 'Current password is incorrect' })
      );

      const res = await request(app)
        .put('/users/password')
        .send({ currentPassword: 'wrong', newPassword: 'new456' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 401 if not authenticated', async () => {
      authMiddleware.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Unauthorized' })
      );

      const res = await request(app)
        .put('/users/password')
        .send({ currentPassword: 'old', newPassword: 'new' });

      expect(res.statusCode).toBe(401);
    });
  });

});