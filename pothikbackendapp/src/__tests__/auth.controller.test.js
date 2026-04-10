/**
 * Unit Tests for Auth Controller
 * ================================
 * Tests: register, login, verifyToken, googleLogin, forgotPassword, resetPassword
 */

const authController = require('../controllers/auth.controller');
const authService = require('../services/auth.service');

// Mock the auth service
jest.mock('../services/auth.service');

// Helper to create mock req/res objects
const mockRequest = (body = {}, params = {}, query = {}, headers = {}) => ({
  body,
  params,
  query,
  headers,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────────────────────
  describe('register', () => {
    it('should register a new user and return 201', async () => {
      const userData = { full_name: 'John Doe', email: 'john@example.com', password: 'pass123' };
      const result = { user: { user_id: 1, ...userData }, token: 'jwt-token' };

      authService.registerUser.mockResolvedValue(result);

      const req = mockRequest(userData);
      const res = mockResponse();

      await authController.register(req, res);

      expect(authService.registerUser).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    });

    it('should return 400 if user already exists', async () => {
      authService.registerUser.mockRejectedValue(new Error('User with this email already exists'));

      const req = mockRequest({ email: 'existing@example.com' });
      const res = mockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User with this email already exists',
      });
    });

    it('should return 500 on unexpected error', async () => {
      authService.registerUser.mockRejectedValue(new Error('Database connection failed'));

      const req = mockRequest({});
      const res = mockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database connection failed',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('should login successfully and return user data with token', async () => {
      const loginData = { email: 'john@example.com', password: 'pass123' };
      const result = { user: { user_id: 1 }, token: 'jwt-token' };

      authService.loginUser.mockResolvedValue(result);

      const req = mockRequest(loginData);
      const res = mockResponse();

      await authController.login(req, res);

      expect(authService.loginUser).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: result,
      });
    });

    it('should return 400 if email is missing', async () => {
      const req = mockRequest({ password: 'pass123' });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email and password are required',
      });
    });

    it('should return 400 if password is missing', async () => {
      const req = mockRequest({ email: 'john@example.com' });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email and password are required',
      });
    });

    it('should return 401 for invalid credentials', async () => {
      authService.loginUser.mockRejectedValue(new Error('Invalid email or password'));

      const req = mockRequest({ email: 'john@example.com', password: 'wrong' });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid email or password',
      });
    });

    it('should return 500 on unexpected error', async () => {
      authService.loginUser.mockRejectedValue(new Error('Server crash'));

      const req = mockRequest({ email: 'john@example.com', password: 'pass123' });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // VERIFY TOKEN
  // ─────────────────────────────────────────────────────────────────────────
  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      const userData = { user_id: 1, full_name: 'John', email: 'john@example.com' };
      authService.verifyUserToken.mockResolvedValue(userData);

      const req = mockRequest({}, {}, {}, { authorization: 'Bearer valid-token' });
      const res = mockResponse();

      await authController.verifyToken(req, res);

      expect(authService.verifyUserToken).toHaveBeenCalledWith('valid-token');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: userData,
      });
    });

    it('should return 401 if authorization header is missing', async () => {
      const req = mockRequest({}, {}, {}, {});
      const res = mockResponse();

      await authController.verifyToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authorization header missing',
      });
    });

    it('should return 401 if token is invalid', async () => {
      authService.verifyUserToken.mockRejectedValue(new Error('jwt malformed'));

      const req = mockRequest({}, {}, {}, { authorization: 'Bearer invalid-token' });
      const res = mockResponse();

      await authController.verifyToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'jwt malformed',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GOOGLE LOGIN
  // ─────────────────────────────────────────────────────────────────────────
  describe('googleLogin', () => {
    it('should login via Google successfully', async () => {
      const result = { user: { user_id: 1 }, token: 'jwt-token' };
      authService.googleLoginUser.mockResolvedValue(result);

      const req = mockRequest({ idToken: 'firebase-id-token' });
      const res = mockResponse();

      await authController.googleLogin(req, res);

      expect(authService.googleLoginUser).toHaveBeenCalledWith('firebase-id-token');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Google login successful',
        data: result,
      });
    });

    it('should return 400 if idToken is missing', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await authController.googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Firebase ID token is required',
      });
    });

    it('should return 401 for Invalid token', async () => {
      authService.googleLoginUser.mockRejectedValue(new Error('Invalid Google authentication token'));

      const req = mockRequest({ idToken: 'bad-token' });
      const res = mockResponse();

      await authController.googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 500 for non-Invalid errors', async () => {
      authService.googleLoginUser.mockRejectedValue(new Error('Firebase SDK not initialized'));

      const req = mockRequest({ idToken: 'token' });
      const res = mockResponse();

      await authController.googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD
  // ─────────────────────────────────────────────────────────────────────────
  describe('forgotPassword', () => {
    it('should send OTP successfully', async () => {
      authService.requestPasswordReset.mockResolvedValue({ message: 'OTP sent to your email address' });

      const req = mockRequest({ email: 'john@example.com' });
      const res = mockResponse();

      await authController.forgotPassword(req, res);

      expect(authService.requestPasswordReset).toHaveBeenCalledWith('john@example.com');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'OTP sent to your email address',
      });
    });

    it('should return 400 if email is missing', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await authController.forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email is required',
      });
    });

    it('should return 404 if no account found', async () => {
      authService.requestPasswordReset.mockRejectedValue(new Error('No account found with this email address'));

      const req = mockRequest({ email: 'unknown@example.com' });
      const res = mockResponse();

      await authController.forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 for other errors', async () => {
      authService.requestPasswordReset.mockRejectedValue(new Error('Google login account'));

      const req = mockRequest({ email: 'google@example.com' });
      const res = mockResponse();

      await authController.forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // RESET PASSWORD
  // ─────────────────────────────────────────────────────────────────────────
  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      authService.resetPassword.mockResolvedValue({ message: 'Password reset successful.' });

      const req = mockRequest({ email: 'john@example.com', otp: '123456', newPassword: 'newPass123' });
      const res = mockResponse();

      await authController.resetPassword(req, res);

      expect(authService.resetPassword).toHaveBeenCalledWith('john@example.com', '123456', 'newPass123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset successful.',
      });
    });

    it('should return 400 if email is missing', async () => {
      const req = mockRequest({ otp: '123456', newPassword: 'newPass123' });
      const res = mockResponse();

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email, OTP, and new password are required',
      });
    });

    it('should return 400 if otp is missing', async () => {
      const req = mockRequest({ email: 'john@example.com', newPassword: 'newPass' });
      const res = mockResponse();

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if newPassword is missing', async () => {
      const req = mockRequest({ email: 'john@example.com', otp: '123456' });
      const res = mockResponse();

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 on invalid OTP', async () => {
      authService.resetPassword.mockRejectedValue(new Error('Invalid OTP'));

      const req = mockRequest({ email: 'john@example.com', otp: 'wrong', newPassword: 'newPass' });
      const res = mockResponse();

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid OTP',
      });
    });
  });
});
