/**
 * Unit Tests for Admin Controller
 * ================================
 * Tests: createAdmin, getAllAdmins, getAdminById, updateAdmin, deleteAdmin,
 *        loginAdmin, getDashboardData, getAllBookings, approveBooking,
 *        assignGuide, cancelBooking, assignHotel, assignTransport,
 *        getAllUsers, createUser, updateUser, deleteUser,
 *        getAllBlogs, createBlog, updateBlog, deleteBlog
 */

const adminController = require('../controllers/admin.controller');
const { User, Package, Booking, Guide, Blog } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock all dependencies
jest.mock('../models', () => ({
  User: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  },
  Package: { count: jest.fn() },
  Booking: { count: jest.fn() },
  Guide: { count: jest.fn() },
  Blog: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
  Op: { like: Symbol('like') },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockRequest = (body = {}, params = {}, query = {}, user = {}) => ({
  body,
  params,
  query,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Admin Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE ADMIN
  // ─────────────────────────────────────────────────────────────────────────
  describe('createAdmin', () => {
    it('should create an admin and return 201', async () => {
      const adminData = { full_name: 'Admin', email: 'admin@test.com', password: 'pass123' };
      bcrypt.hash.mockResolvedValue('hashed-password');
      User.create.mockResolvedValue({ id: 1, ...adminData, role: 'admin' });

      const req = mockRequest(adminData);
      const res = mockResponse();

      await adminController.createAdmin(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
      expect(User.create).toHaveBeenCalledWith({
        full_name: 'Admin',
        email: 'admin@test.com',
        password_hash: 'hashed-password',
        role: 'admin',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 400 if required fields are missing', async () => {
      const req = mockRequest({ full_name: 'Admin' }); // missing email, password
      const res = mockResponse();

      await adminController.createAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Full name, email, and password are required',
      }));
    });

    it('should return 500 on database error', async () => {
      bcrypt.hash.mockResolvedValue('hash');
      User.create.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({ full_name: 'A', email: 'a@b.com', password: 'pass' });
      const res = mockResponse();

      await adminController.createAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL ADMINS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllAdmins', () => {
    it('should return all admins', async () => {
      const admins = [{ id: 1, full_name: 'Admin1' }, { id: 2, full_name: 'Admin2' }];
      User.findAll.mockResolvedValue(admins);

      const req = mockRequest();
      const res = mockResponse();

      await adminController.getAllAdmins(req, res);

      expect(User.findAll).toHaveBeenCalledWith({ where: { role: 'admin' } });
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: admins });
    });

    it('should return 500 on error', async () => {
      User.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await adminController.getAllAdmins(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ADMIN BY ID
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAdminById', () => {
    it('should return admin by id', async () => {
      const admin = { id: 1, full_name: 'Admin' };
      User.findByPk.mockResolvedValue(admin);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await adminController.getAdminById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: admin });
    });

    it('should return 404 if admin not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await adminController.getAdminById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      User.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await adminController.getAdminById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE ADMIN
  // ─────────────────────────────────────────────────────────────────────────
  describe('updateAdmin', () => {
    it('should update admin successfully', async () => {
      const admin = { id: 1, update: jest.fn().mockResolvedValue(true) };
      User.findByPk.mockResolvedValue(admin);

      const req = mockRequest({ full_name: 'Updated Admin' }, { id: 1 });
      const res = mockResponse();

      await adminController.updateAdmin(req, res);

      expect(admin.update).toHaveBeenCalledWith({ full_name: 'Updated Admin' });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should hash password if provided in update', async () => {
      const admin = { id: 1, update: jest.fn().mockResolvedValue(true) };
      User.findByPk.mockResolvedValue(admin);
      bcrypt.hash.mockResolvedValue('new-hashed');

      const req = mockRequest({ password: 'newpass' }, { id: 1 });
      const res = mockResponse();

      await adminController.updateAdmin(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
    });

    it('should return 404 if admin not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await adminController.updateAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE ADMIN
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteAdmin', () => {
    it('should delete admin successfully', async () => {
      const admin = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      User.findByPk.mockResolvedValue(admin);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await adminController.deleteAdmin(req, res);

      expect(admin.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Admin deleted successfully' });
    });

    it('should return 404 if admin not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await adminController.deleteAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIN ADMIN
  // ─────────────────────────────────────────────────────────────────────────
  describe('loginAdmin', () => {
    it('should login admin and return token', async () => {
      const admin = { id: 1, full_name: 'Admin', email: 'admin@test.com', password_hash: 'hashed' };
      User.findOne.mockResolvedValue(admin);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('admin-jwt-token');

      const req = mockRequest({ email: 'admin@test.com', password: 'pass' });
      const res = mockResponse();

      await adminController.loginAdmin(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'admin@test.com', role: 'admin' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('pass', 'hashed');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Admin login successful',
      }));
    });

    it('should return 400 if email or password missing', async () => {
      const req = mockRequest({ email: 'admin@test.com' });
      const res = mockResponse();

      await adminController.loginAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 401 if admin not found', async () => {
      User.findOne.mockResolvedValue(null);

      const req = mockRequest({ email: 'bad@test.com', password: 'pass' });
      const res = mockResponse();

      await adminController.loginAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 if password mismatch', async () => {
      User.findOne.mockResolvedValue({ password_hash: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      const req = mockRequest({ email: 'admin@test.com', password: 'wrong' });
      const res = mockResponse();

      await adminController.loginAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET DASHBOARD DATA
  // ─────────────────────────────────────────────────────────────────────────
  describe('getDashboardData', () => {
    it('should return dashboard statistics', async () => {
      User.count.mockResolvedValue(100);
      Package.count.mockResolvedValue(10);
      Booking.count
        .mockResolvedValueOnce(5)   // pending
        .mockResolvedValueOnce(3)   // confirmed
        .mockResolvedValueOnce(2);  // custom
      Guide.count.mockResolvedValue(8);

      const req = mockRequest();
      const res = mockResponse();

      await adminController.getDashboardData(req, res);

      expect(res.json).toHaveBeenCalledWith({
        totalUsers: 100,
        activePackages: 10,
        pendingBookings: 5,
        ongoingTours: 3,
        customRequests: 2,
        availableGuides: 8,
      });
    });

    it('should return 500 on error', async () => {
      User.count.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await adminController.getDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PLACEHOLDER BOOKING ACTIONS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllBookings', () => {
    it('should return success response', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await adminController.getAllBookings(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('approveBooking', () => {
    it('should approve booking by id', async () => {
      const req = mockRequest({}, { id: 5 });
      const res = mockResponse();

      await adminController.approveBooking(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Booking 5 approved' });
    });
  });

  describe('assignGuide', () => {
    it('should assign guide to booking', async () => {
      const req = mockRequest({}, { id: 3 });
      const res = mockResponse();

      await adminController.assignGuide(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Guide assigned to booking 3' });
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking', async () => {
      const req = mockRequest({}, { id: 7 });
      const res = mockResponse();

      await adminController.cancelBooking(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Booking 7 cancelled' });
    });
  });

  describe('assignHotel', () => {
    it('should assign hotel to booking', async () => {
      const req = mockRequest({}, { id: 2 });
      const res = mockResponse();

      await adminController.assignHotel(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Hotel assigned to booking 2' });
    });
  });

  describe('assignTransport', () => {
    it('should assign transport to booking', async () => {
      const req = mockRequest({}, { id: 4 });
      const res = mockResponse();

      await adminController.assignTransport(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Transport assigned to booking 4' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // USER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllUsers', () => {
    it('should return all customer users', async () => {
      const users = [{ user_id: 1, role: 'customer' }];
      User.findAll.mockResolvedValue(users);

      const req = mockRequest();
      const res = mockResponse();

      await adminController.getAllUsers(req, res);

      expect(User.findAll).toHaveBeenCalledWith({
        where: { role: 'customer' },
        order: [['user_id', 'DESC']],
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, users });
    });
  });

  describe('createUser', () => {
    it('should create user and return 201', async () => {
      bcrypt.hash.mockResolvedValue('hash');
      User.create.mockResolvedValue({ user_id: 1, full_name: 'User' });

      const req = mockRequest({ full_name: 'User', email: 'u@t.com', password: 'pass' });
      const res = mockResponse();

      await adminController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 if required fields missing', async () => {
      const req = mockRequest({ full_name: 'User' });
      const res = mockResponse();

      await adminController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const user = { update: jest.fn().mockResolvedValue(true) };
      User.findByPk.mockResolvedValue(user);

      const req = mockRequest({ full_name: 'Updated' }, { id: 1 });
      const res = mockResponse();

      await adminController.updateUser(req, res);

      expect(user.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await adminController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const user = { destroy: jest.fn().mockResolvedValue(true) };
      User.findByPk.mockResolvedValue(user);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await adminController.deleteUser(req, res);

      expect(user.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User deleted successfully' });
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await adminController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BLOG MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllBlogs', () => {
    it('should return all blogs', async () => {
      const blogs = [{ blog_id: 1, title: 'Blog 1' }];
      Blog.findAll.mockResolvedValue(blogs);

      const req = mockRequest();
      const res = mockResponse();

      await adminController.getAllBlogs(req, res);

      expect(Blog.findAll).toHaveBeenCalledWith({ include: [User] });
      expect(res.json).toHaveBeenCalledWith({ success: true, blogs });
    });

    it('should return 500 on error', async () => {
      Blog.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await adminController.getAllBlogs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createBlog', () => {
    it('should create blog and return 201', async () => {
      Blog.create.mockResolvedValue({ blog_id: 1, title: 'New Blog' });

      const req = mockRequest(
        { title: 'New Blog', content: 'Content here', slug: 'new-blog' },
        {},
        {},
        { id: 1 }
      );
      const res = mockResponse();

      await adminController.createBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 if required fields missing', async () => {
      const req = mockRequest({ title: 'Blog' }, {}, {}, { id: 1 });
      const res = mockResponse();

      await adminController.createBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateBlog', () => {
    it('should update blog successfully', async () => {
      const blog = { update: jest.fn().mockResolvedValue(true) };
      Blog.findByPk.mockResolvedValue(blog);

      const req = mockRequest({ title: 'Updated' }, { id: 1 });
      const res = mockResponse();

      await adminController.updateBlog(req, res);

      expect(blog.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 404 if blog not found', async () => {
      Blog.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await adminController.updateBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteBlog', () => {
    it('should delete blog successfully', async () => {
      const blog = { destroy: jest.fn().mockResolvedValue(true) };
      Blog.findByPk.mockResolvedValue(blog);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await adminController.deleteBlog(req, res);

      expect(blog.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Blog deleted successfully' });
    });

    it('should return 404 if blog not found', async () => {
      Blog.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await adminController.deleteBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
