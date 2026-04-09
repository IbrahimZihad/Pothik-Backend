// src/__tests__/auth.service.test.js

// ---------- Mocks ----------
jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  LoyaltyHistory: {
    create: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('../config', () => ({
  JWT_SECRET: 'test-secret',
}));

jest.mock('../config/firebase-admin.config', () => ({
  apps: [true], // simulate initialized
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

jest.mock('../services/email.service', () => ({
  sendPasswordResetOTP: jest.fn(),
  verifyOTP: jest.fn(),
}));

const { User, LoyaltyHistory } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebase-admin.config');
const authService = require('../services/auth.service');

describe('Auth Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- registerUser ----------
  describe('registerUser()', () => {
    const userData = {
      full_name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
      phone: '01700000000',
      role: 'customer',
    };

    const mockUser = {
      user_id: 1,
      full_name: 'Alice',
      email: 'alice@example.com',
      phone: '01700000000',
      role: 'customer',
      loyalty_points: 50,
      country: null,
      street_address: null,
    };

    it('should register a new user and return user + token', async () => {
      User.findOne.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce('hashed_password');
      User.create.mockResolvedValueOnce(mockUser);
      LoyaltyHistory.create.mockResolvedValueOnce({});
      jwt.sign.mockReturnValueOnce('mock-token');

      const result = await authService.registerUser(userData);

      expect(User.findOne).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalledTimes(1);
      expect(LoyaltyHistory.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('token', 'mock-token');
      expect(result.user.email).toBe('alice@example.com');
    });

    it('should throw if user with email already exists', async () => {
      User.findOne.mockResolvedValueOnce(mockUser);

      await expect(authService.registerUser(userData))
        .rejects.toThrow('User with this email already exists');

      expect(User.create).not.toHaveBeenCalled();
    });

    it('should assign default role of customer if role not provided', async () => {
      User.findOne.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce('hashed_password');
      User.create.mockResolvedValueOnce({ ...mockUser, role: 'customer' });
      LoyaltyHistory.create.mockResolvedValueOnce({});
      jwt.sign.mockReturnValueOnce('mock-token');

      await authService.registerUser({ ...userData, role: undefined });

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'customer' })
      );
    });

    it('should create a welcome loyalty bonus of 50 points', async () => {
      User.findOne.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce('hashed_password');
      User.create.mockResolvedValueOnce(mockUser);
      LoyaltyHistory.create.mockResolvedValueOnce({});
      jwt.sign.mockReturnValueOnce('mock-token');

      await authService.registerUser(userData);

      expect(LoyaltyHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({ points_added: 50, user_id: mockUser.user_id })
      );
    });
  });

  // ---------- loginUser ----------
  describe('loginUser()', () => {
    const mockUser = {
      user_id: 1,
      full_name: 'Alice',
      email: 'alice@example.com',
      phone: '01700000000',
      role: 'customer',
      loyalty_points: 50,
      country: null,
      street_address: null,
      auth_provider: 'local',
      password_hash: 'hashed_password',
    };

    it('should login successfully and return user + token', async () => {
      User.findOne.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('mock-token');

      const result = await authService.loginUser('alice@example.com', 'password123');

      expect(User.findOne).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(result).toHaveProperty('token', 'mock-token');
      expect(result.user.email).toBe('alice@example.com');
    });

    it('should throw if user not found', async () => {
      User.findOne.mockResolvedValueOnce(null);

      await expect(authService.loginUser('nobody@example.com', 'pass'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw if user is a Google OAuth user', async () => {
      User.findOne.mockResolvedValueOnce({ ...mockUser, auth_provider: 'google', password_hash: null });

      await expect(authService.loginUser('alice@example.com', 'password123'))
        .rejects.toThrow('Please sign in with Google');
    });

    it('should throw if password is invalid', async () => {
      User.findOne.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(authService.loginUser('alice@example.com', 'wrongpass'))
        .rejects.toThrow('Invalid email or password');
    });
  });

  // ---------- googleLoginUser ----------
  describe('googleLoginUser()', () => {
    const mockDecodedToken = {
      uid: 'firebase-uid-123',
      email: 'alice@example.com',
      name: 'Alice',
      picture: 'https://photo.url',
    };

    const mockUser = {
      user_id: 1,
      full_name: 'Alice',
      email: 'alice@example.com',
      phone: null,
      role: 'customer',
      loyalty_points: 50,
      country: null,
      street_address: null,
      firebase_uid: 'firebase-uid-123',
      auth_provider: 'google',
      save: jest.fn(),
    };

    it('should login existing Google user by firebase_uid', async () => {
      admin.auth.mockReturnValueOnce({ verifyIdToken: jest.fn().mockResolvedValueOnce(mockDecodedToken) });
      User.findOne.mockResolvedValueOnce(mockUser);
      jwt.sign.mockReturnValueOnce('google-token');

      const result = await authService.googleLoginUser('valid-id-token');

      expect(result).toHaveProperty('token', 'google-token');
      expect(result.user.email).toBe('alice@example.com');
    });

    it('should link existing email account with Google if firebase_uid not found', async () => {
      const existingUser = { ...mockUser, firebase_uid: null, auth_provider: 'local', save: jest.fn() };

      admin.auth.mockReturnValueOnce({ verifyIdToken: jest.fn().mockResolvedValueOnce(mockDecodedToken) });
      User.findOne
        .mockResolvedValueOnce(null)          // first: by firebase_uid
        .mockResolvedValueOnce(existingUser); // second: by email
      jwt.sign.mockReturnValueOnce('google-token');

      const result = await authService.googleLoginUser('valid-id-token');

      expect(existingUser.save).toHaveBeenCalled();
      expect(result).toHaveProperty('token', 'google-token');
    });

    it('should create a new user if no account found', async () => {
      admin.auth.mockReturnValueOnce({ verifyIdToken: jest.fn().mockResolvedValueOnce(mockDecodedToken) });
      User.findOne
        .mockResolvedValueOnce(null)  // by firebase_uid
        .mockResolvedValueOnce(null); // by email
      User.create.mockResolvedValueOnce(mockUser);
      LoyaltyHistory.create.mockResolvedValueOnce({});
      jwt.sign.mockReturnValueOnce('google-token');

      const result = await authService.googleLoginUser('valid-id-token');

      expect(User.create).toHaveBeenCalledTimes(1);
      expect(LoyaltyHistory.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('token', 'google-token');
    });

    it('should throw if Firebase Admin is not initialized', async () => {
      admin.apps = [];

      await expect(authService.googleLoginUser('some-token'))
        .rejects.toThrow('Invalid Google authentication token');

      admin.apps = [true]; // restore
    });

    it('should throw if Firebase token verification fails', async () => {
      admin.auth.mockReturnValueOnce({ verifyIdToken: jest.fn().mockRejectedValueOnce(new Error('bad token')) });

      await expect(authService.googleLoginUser('bad-token'))
        .rejects.toThrow('Invalid Google authentication token');
    });
  });

  // ---------- verifyUserToken ----------
  describe('verifyUserToken()', () => {
    const mockUser = {
      user_id: 1,
      full_name: 'Alice',
      email: 'alice@example.com',
      role: 'customer',
      phone: '01700000000',
      loyalty_points: 50,
      country: null,
      street_address: null,
    };

    it('should return user data for a valid token', async () => {
      jwt.verify.mockReturnValueOnce({ user_id: 1 });
      User.findByPk.mockResolvedValueOnce(mockUser);

      const result = await authService.verifyUserToken('valid-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(result.email).toBe('alice@example.com');
    });

    it('should throw if no token is provided', async () => {
      await expect(authService.verifyUserToken(null))
        .rejects.toThrow('No token provided');
    });

    it('should throw if user not found after token decode', async () => {
      jwt.verify.mockReturnValueOnce({ user_id: 999 });
      User.findByPk.mockResolvedValueOnce(null);

      await expect(authService.verifyUserToken('valid-token'))
        .rejects.toThrow('User not found');
    });

    it('should throw if token is invalid', async () => {
      jwt.verify.mockImplementationOnce(() => { throw new Error('invalid signature'); });

      await expect(authService.verifyUserToken('bad-token'))
        .rejects.toThrow('invalid signature');
    });
  });

  // ---------- generateToken ----------
  describe('generateToken()', () => {
    it('should call jwt.sign with correct payload and return token', () => {
      jwt.sign.mockReturnValueOnce('signed-token');

      const token = authService.generateToken({ user_id: 1, role: 'customer' });

      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: 1, role: 'customer' },
        'test-secret',
        { expiresIn: '7d' }
      );
      expect(token).toBe('signed-token');
    });
  });

  // ---------- hashPassword ----------
  describe('hashPassword()', () => {
    it('should return a hashed password', async () => {
      bcrypt.hash.mockResolvedValueOnce('hashed_pw');

      const result = await authService.hashPassword('mypassword');

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10);
      expect(result).toBe('hashed_pw');
    });
  });

  // ---------- verifyPassword ----------
  describe('verifyPassword()', () => {
    it('should return true for matching password', async () => {
      bcrypt.compare.mockResolvedValueOnce(true);

      const result = await authService.verifyPassword('mypassword', 'hashed_pw');

      expect(bcrypt.compare).toHaveBeenCalledWith('mypassword', 'hashed_pw');
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);

      const result = await authService.verifyPassword('wrongpassword', 'hashed_pw');

      expect(result).toBe(false);
    });
  });

  // ---------- requestPasswordReset ----------
  describe('requestPasswordReset()', () => {
    it('should send OTP and return success message', async () => {
      const emailService = require('../services/email.service');
      User.findOne.mockResolvedValueOnce({
        user_id: 1,
        email: 'alice@example.com',
        auth_provider: 'local',
        password_hash: 'hashed_pw',
      });
      emailService.sendPasswordResetOTP.mockResolvedValueOnce({});

      const result = await authService.requestPasswordReset('alice@example.com');

      expect(User.findOne).toHaveBeenCalledTimes(1);
      expect(emailService.sendPasswordResetOTP).toHaveBeenCalledWith('alice@example.com');
      expect(result).toEqual({ message: 'OTP sent to your email address' });
    });

    it('should throw if email not found', async () => {
      User.findOne.mockResolvedValueOnce(null);

      await expect(authService.requestPasswordReset('nobody@example.com'))
        .rejects.toThrow('No account found with this email address');
    });

    it('should throw if user is a Google OAuth account', async () => {
      User.findOne.mockResolvedValueOnce({
        auth_provider: 'google',
        password_hash: null,
      });

      await expect(authService.requestPasswordReset('alice@example.com'))
        .rejects.toThrow('This account uses Google login. Please sign in with Google instead.');
    });
  });

  // ---------- resetPassword ----------
  describe('resetPassword()', () => {
    it('should reset password successfully', async () => {
      const emailService = require('../services/email.service');
      emailService.verifyOTP.mockReturnValueOnce(true);
      bcrypt.hash.mockResolvedValueOnce('new_hashed_pw');
      User.update.mockResolvedValueOnce([1]);

      const result = await authService.resetPassword('alice@example.com', '123456', 'newpassword');

      expect(emailService.verifyOTP).toHaveBeenCalledWith('alice@example.com', '123456');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(User.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'Password reset successful. You can now login with your new password.' });
    });

    it('should throw if new password is too short', async () => {
      const emailService = require('../services/email.service');
      emailService.verifyOTP.mockReturnValueOnce(true);

      await expect(authService.resetPassword('alice@example.com', '123456', '123'))
        .rejects.toThrow('Password must be at least 6 characters long');
    });

    it('should throw if user not found during update', async () => {
      const emailService = require('../services/email.service');
      emailService.verifyOTP.mockReturnValueOnce(true);
      bcrypt.hash.mockResolvedValueOnce('new_hashed_pw');
      User.update.mockResolvedValueOnce([0]);

      await expect(authService.resetPassword('nobody@example.com', '123456', 'newpassword'))
        .rejects.toThrow('Failed to update password. User not found.');
    });
  });

});