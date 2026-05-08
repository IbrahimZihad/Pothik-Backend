/**
 * Unit Tests for User Controller
 * =================================
 * Tests: register, login, getProfile, updateProfile,
 *        updatePassword, uploadProfileImage
 */

const userController = require('../controllers/user.controller');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../models', () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../config', () => ({
  JWT_SECRET: 'test-secret',
  JWT_EXPIRES_IN: '7d',
}));

const mockRequest = (body = {}, params = {}, user = {}, file = null) => ({
  body,
  params,
  user,
  file,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('User Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────────────────────
  describe('register', () => {
    it('should register user and return 201', async () => {
      bcrypt.hash.mockResolvedValue('hashed-password');
      User.create.mockResolvedValue({ user_id: 1, full_name: 'John' });

      const req = mockRequest({
        full_name: 'John',
        email: 'john@test.com',
        password: 'pass123',
        phone: '01700000000',
        role: 'customer',
      });
      const res = mockResponse();

      await userController.register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        full_name: 'John',
        email: 'john@test.com',
        password_hash: 'hashed-password',
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    it('should return 500 on error', async () => {
      bcrypt.hash.mockRejectedValue(new Error('Hash error'));

      const req = mockRequest({ password: 'pass' });
      const res = mockResponse();

      await userController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('should login user and return token', async () => {
      const user = { user_id: 1, email: 'john@test.com', password_hash: 'hashed', role: 'customer' };
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('jwt-token');

      const req = mockRequest({ email: 'john@test.com', password: 'pass' });
      const res = mockResponse();

      await userController.login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'john@test.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('pass', 'hashed');
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: 1, role: 'customer' },
        'test-secret',
        { expiresIn: '7d' }
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Login successful',
        token: 'jwt-token',
      }));
    });

    it('should return 401 if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const req = mockRequest({ email: 'bad@test.com', password: 'pass' });
      const res = mockResponse();

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email or password' });
    });

    it('should return 401 if password mismatch', async () => {
      User.findOne.mockResolvedValue({ password_hash: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      const req = mockRequest({ email: 'john@test.com', password: 'wrong' });
      const res = mockResponse();

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 500 on error', async () => {
      User.findOne.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({ email: 'john@test.com', password: 'pass' });
      const res = mockResponse();

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PROFILE
  // ─────────────────────────────────────────────────────────────────────────
  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = { user_id: 1, full_name: 'John' };
      User.findByPk.mockResolvedValue(user);

      const req = mockRequest({}, {}, { user_id: 1 });
      const res = mockResponse();

      await userController.getProfile(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1, expect.objectContaining({
        attributes: expect.any(Array),
      }));
      expect(res.json).toHaveBeenCalledWith({ user });
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, {}, { user_id: 999 });
      const res = mockResponse();

      await userController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 500 on error', async () => {
      User.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, {}, { user_id: 1 });
      const res = mockResponse();

      await userController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE PROFILE
  // ─────────────────────────────────────────────────────────────────────────
  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const user = {
        user_id: 1,
        full_name: 'John',
        phone: '01700000000',
        update: jest.fn().mockResolvedValue(true),
      };
      User.findByPk
        .mockResolvedValueOnce(user)  // first call (find user)
        .mockResolvedValueOnce({ user_id: 1, full_name: 'Updated John' }); // second call (fetch updated)

      const req = mockRequest({ full_name: 'Updated John' }, {}, { user_id: 1 });
      const res = mockResponse();

      await userController.updateProfile(req, res);

      expect(user.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Profile updated successfully',
      }));
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, {}, { user_id: 999 });
      const res = mockResponse();

      await userController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE PASSWORD
  // ─────────────────────────────────────────────────────────────────────────
  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const user = { user_id: 1, password_hash: 'old-hash', update: jest.fn().mockResolvedValue(true) };
      User.findByPk.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('new-hash');

      const req = mockRequest(
        { currentPassword: 'oldpass', newPassword: 'newpass' },
        {},
        { user_id: 1 }
      );
      const res = mockResponse();

      await userController.updatePassword(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', 'old-hash');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
      expect(user.update).toHaveBeenCalledWith({ password_hash: 'new-hash' });
      expect(res.json).toHaveBeenCalledWith({ message: 'Password updated successfully' });
    });

    it('should return 401 if current password is wrong', async () => {
      const user = { user_id: 1, password_hash: 'hash' };
      User.findByPk.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      const req = mockRequest(
        { currentPassword: 'wrong', newPassword: 'new' },
        {},
        { user_id: 1 }
      );
      const res = mockResponse();

      await userController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Current password is incorrect' });
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, {}, { user_id: 999 });
      const res = mockResponse();

      await userController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPLOAD PROFILE IMAGE
  // ─────────────────────────────────────────────────────────────────────────
  describe('uploadProfileImage', () => {
    it('should upload profile image successfully', async () => {
      const user = { user_id: 1, update: jest.fn().mockResolvedValue(true) };
      User.findByPk
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce({ user_id: 1, profile_image: 'photo.jpg' });

      const req = mockRequest({}, {}, { user_id: 1 }, { filename: 'photo.jpg' });
      const res = mockResponse();

      await userController.uploadProfileImage(req, res);

      expect(user.update).toHaveBeenCalledWith({ profile_image: 'photo.jpg' });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Profile image updated successfully',
      }));
    });

    it('should return 400 if no file provided', async () => {
      const req = mockRequest({}, {}, { user_id: 1 }, null);
      const res = mockResponse();

      await userController.uploadProfileImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'No image file provided' });
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, {}, { user_id: 999 }, { filename: 'photo.jpg' });
      const res = mockResponse();

      await userController.uploadProfileImage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      User.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, {}, { user_id: 1 }, { filename: 'photo.jpg' });
      const res = mockResponse();

      await userController.uploadProfileImage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
