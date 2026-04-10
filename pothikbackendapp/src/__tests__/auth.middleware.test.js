const jwt = require('jsonwebtoken');
const { authMiddleware, isAdmin } = require('../middleware/auth.middleware');

// Mock jwt module
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request, response, and next function
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    
    // Set environment variable
    process.env.JWT_SECRET = 'test-secret';
  });

  // ─── authMiddleware Tests ─────────────────────────────────────────────────
  describe('authMiddleware', () => {
    it('should call next() when valid token is provided', () => {
      const mockDecoded = { id: 'user-123', email: 'test@example.com' };
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);

      authMiddleware(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is missing', () => {
      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Token not provided',
      });
      expect(next).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is empty string', () => {
      req.headers.authorization = '';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Token not provided',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token format is invalid (no Bearer prefix)', () => {
      req.headers.authorization = 'invalid-token';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Invalid token format',
      });
      expect(next).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should return 401 when Bearer token is empty', () => {
      req.headers.authorization = 'Bearer ';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Invalid token format',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', () => {
      req.headers.authorization = 'Bearer expired-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Invalid or expired token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Invalid or expired token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token signature is invalid', () => {
      req.headers.authorization = 'Bearer tampered-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Invalid or expired token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should attach complete decoded payload to req.user', () => {
      const mockDecoded = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'user',
        iat: 1234567890,
        exp: 1234567900,
      };
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);

      authMiddleware(req, res, next);

      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // ─── isAdmin Middleware Tests ─────────────────────────────────────────────
  describe('isAdmin', () => {
    it('should call next() when valid admin token is provided', () => {
      const mockDecoded = {
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      };
      req.headers.authorization = 'Bearer admin-token';
      jwt.verify.mockReturnValue(mockDecoded);

      isAdmin(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('admin-token', 'test-secret');
      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is missing', () => {
      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Token not provided',
      });
      expect(next).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is empty string', () => {
      req.headers.authorization = '';

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Token not provided',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token format is invalid', () => {
      req.headers.authorization = 'invalid-token';

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Invalid token format',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when Bearer token is empty', () => {
      req.headers.authorization = 'Bearer ';

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Invalid token format',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when user role is not admin', () => {
      const mockDecoded = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
      };
      req.headers.authorization = 'Bearer user-token';
      jwt.verify.mockReturnValue(mockDecoded);

      isAdmin(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('user-token', 'test-secret');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Forbidden: Admin access required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when role is undefined', () => {
      const mockDecoded = {
        id: 'user-123',
        email: 'user@example.com',
      };
      req.headers.authorization = 'Bearer user-token';
      jwt.verify.mockReturnValue(mockDecoded);

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Forbidden: Admin access required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when role is empty string', () => {
      const mockDecoded = {
        id: 'user-123',
        email: 'user@example.com',
        role: '',
      };
      req.headers.authorization = 'Bearer user-token';
      jwt.verify.mockReturnValue(mockDecoded);

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Forbidden: Admin access required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when role is moderator (not admin)', () => {
      const mockDecoded = {
        id: 'mod-123',
        email: 'mod@example.com',
        role: 'moderator',
      };
      req.headers.authorization = 'Bearer mod-token';
      jwt.verify.mockReturnValue(mockDecoded);

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Forbidden: Admin access required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', () => {
      req.headers.authorization = 'Bearer expired-admin-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Invalid or expired token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      req.headers.authorization = 'Bearer invalid-admin-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized: Invalid or expired token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should attach complete admin payload to req.user', () => {
      const mockDecoded = {
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['read', 'write', 'delete'],
        iat: 1234567890,
      };
      req.headers.authorization = 'Bearer admin-token';
      jwt.verify.mockReturnValue(mockDecoded);

      isAdmin(req, res, next);

      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});