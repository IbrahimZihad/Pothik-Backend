const { isAdmin } = require('../middleware/role.middleware');

describe('Role Middleware - isAdmin', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  // ─── TEST CASES ─────────────────────────────────────────────

  it('should return 401 if req.user is not present', () => {
    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized: Login required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not admin', () => {
    req.user = {
      id: 'user-123',
      email: 'user@example.com',
      isAdmin: false,
    };

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Access denied: Admin only",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if isAdmin is undefined', () => {
    req.user = {
      id: 'user-123',
      email: 'user@example.com',
    };

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if isAdmin is null', () => {
    req.user = {
      id: 'user-123',
      isAdmin: null,
    };

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if user is admin', () => {
    req.user = {
      id: 'admin-123',
      email: 'admin@example.com',
      isAdmin: true,
    };

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should allow admin even with extra fields', () => {
    req.user = {
      id: 'admin-123',
      email: 'admin@example.com',
      isAdmin: true,
      role: 'admin',
      permissions: ['all'],
    };

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});