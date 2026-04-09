const request = require('supertest');
const express = require('express');

// Mock middlewares
jest.mock('../middleware/auth.middleware', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    req.user = { id: 'admin-123', role: 'admin' };
    next();
  }),
  isAdmin: jest.fn((req, res, next) => {
    req.user = { id: 'admin-123', role: 'admin' };
    next();
  }),
}));

// Mock admin controller
jest.mock('../controllers/admin.controller', () => ({
  getDashboardData:   jest.fn((req, res) => res.status(200).json({ stats: {} })),
  getAllUsers:         jest.fn((req, res) => res.status(200).json({ users: [] })),
  createUser:         jest.fn((req, res) => res.status(201).json({ message: 'User created' })),
  updateUser:         jest.fn((req, res) => res.status(200).json({ message: 'User updated' })),
  deleteUser:         jest.fn((req, res) => res.status(200).json({ message: 'User deleted' })),
  getAllBookings:      jest.fn((req, res) => res.status(200).json({ bookings: [] })),
  approveBooking:     jest.fn((req, res) => res.status(200).json({ message: 'Booking approved' })),
  assignGuide:        jest.fn((req, res) => res.status(200).json({ message: 'Guide assigned' })),
  cancelBooking:      jest.fn((req, res) => res.status(200).json({ message: 'Booking cancelled' })),
  assignHotel:        jest.fn((req, res) => res.status(200).json({ message: 'Hotel assigned' })),
  assignTransport:    jest.fn((req, res) => res.status(200).json({ message: 'Transport assigned' })),
  getAllBlogs:         jest.fn((req, res) => res.status(200).json({ blogs: [] })),
  createBlog:         jest.fn((req, res) => res.status(201).json({ message: 'Blog created' })),
  updateBlog:         jest.fn((req, res) => res.status(200).json({ message: 'Blog updated' })),
  deleteBlog:         jest.fn((req, res) => res.status(200).json({ message: 'Blog deleted' })),
  createAdmin:        jest.fn((req, res) => res.status(201).json({ message: 'Admin created' })),
  loginAdmin:         jest.fn((req, res) => res.status(200).json({ token: 'admin-token' })),
  getAllAdmins:        jest.fn((req, res) => res.status(200).json({ admins: [] })),
  getAdminById:       jest.fn((req, res) => res.status(200).json({ id: 'admin-123' })),
  updateAdmin:        jest.fn((req, res) => res.status(200).json({ message: 'Admin updated' })),
  deleteAdmin:        jest.fn((req, res) => res.status(200).json({ message: 'Admin deleted' })),
}));

const adminRoutes = require('../routes/admin.routes');
const adminController = require('../controllers/admin.controller');
const { authMiddleware, isAdmin } = require('../middleware/auth.middleware');

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

describe('Admin Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Dashboard ────────────────────────────────────────────────────────────
  describe('GET /admin/dashboard', () => {
    it('should return dashboard data for admin', async () => {
      const res = await request(app).get('/admin/dashboard');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('stats');
      expect(isAdmin).toHaveBeenCalledTimes(1);
    });

    it('should return 403 for non-admin user', async () => {
      isAdmin.mockImplementationOnce((req, res) =>
        res.status(403).json({ error: 'Forbidden' })
      );
      const res = await request(app).get('/admin/dashboard');
      expect(res.statusCode).toBe(403);
      expect(adminController.getDashboardData).not.toHaveBeenCalled();
    });
  });

  // ─── Users ────────────────────────────────────────────────────────────────
  describe('GET /admin/users', () => {
    it('should return all users for admin', async () => {
      const res = await request(app).get('/admin/users');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('users');
    });

    it('should return 403 for non-admin', async () => {
      isAdmin.mockImplementationOnce((req, res) =>
        res.status(403).json({ error: 'Forbidden' })
      );
      const res = await request(app).get('/admin/users');
      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /admin/users', () => {
    it('should create a user', async () => {
      const res = await request(app)
        .post('/admin/users')
        .send({ name: 'John', email: 'john@test.com', password: '123456' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: 'User created' });
    });

    it('should return 403 for non-admin', async () => {
      isAdmin.mockImplementationOnce((req, res) =>
        res.status(403).json({ error: 'Forbidden' })
      );
      const res = await request(app).post('/admin/users').send({});
      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /admin/users/:id', () => {
    it('should update a user by ID', async () => {
      const res = await request(app)
        .put('/admin/users/user-456')
        .send({ name: 'Updated Name' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'User updated' });
      expect(adminController.updateUser).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if user not found', async () => {
      adminController.updateUser.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'User not found' })
      );
      const res = await request(app).put('/admin/users/nonexistent').send({});
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /admin/users/:id', () => {
    it('should delete a user by ID', async () => {
      const res = await request(app).delete('/admin/users/user-456');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'User deleted' });
    });

    it('should return 404 if user not found', async () => {
      adminController.deleteUser.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'User not found' })
      );
      const res = await request(app).delete('/admin/users/nonexistent');
      expect(res.statusCode).toBe(404);
    });
  });

  // ─── Bookings ─────────────────────────────────────────────────────────────
  describe('GET /admin/bookings', () => {
    it('should return all bookings for admin', async () => {
      const res = await request(app).get('/admin/bookings');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('bookings');
    });
  });

  describe('POST /admin/bookings/:id/approve', () => {
    it('should approve a booking', async () => {
      const res = await request(app).post('/admin/bookings/booking-1/approve');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Booking approved' });
    });

    it('should return 404 if booking not found', async () => {
      adminController.approveBooking.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'Booking not found' })
      );
      const res = await request(app).post('/admin/bookings/bad-id/approve');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /admin/bookings/:id/assign-guide', () => {
    it('should assign a guide to a booking', async () => {
      const res = await request(app)
        .post('/admin/bookings/booking-1/assign-guide')
        .send({ guideId: 'guide-99' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Guide assigned' });
    });
  });

  describe('POST /admin/bookings/:id/cancel', () => {
    it('should cancel a booking', async () => {
      const res = await request(app).post('/admin/bookings/booking-1/cancel');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Booking cancelled' });
    });
  });

  describe('POST /admin/bookings/:id/assign-hotel', () => {
    it('should assign a hotel to a booking', async () => {
      const res = await request(app)
        .post('/admin/bookings/booking-1/assign-hotel')
        .send({ hotelId: 'hotel-5' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Hotel assigned' });
    });
  });

  describe('POST /admin/bookings/:id/assign-transport', () => {
    it('should assign transport to a booking', async () => {
      const res = await request(app)
        .post('/admin/bookings/booking-1/assign-transport')
        .send({ transportId: 'transport-3' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Transport assigned' });
    });
  });

  // ─── Blogs (Admin) ────────────────────────────────────────────────────────
  describe('GET /admin/blogs', () => {
    it('should return all blogs for admin', async () => {
      const res = await request(app).get('/admin/blogs');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('blogs');
    });
  });

  describe('POST /admin/blogs', () => {
    it('should create a blog', async () => {
      const res = await request(app)
        .post('/admin/blogs')
        .send({ title: 'New Blog', content: 'Content here' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: 'Blog created' });
    });
  });

  describe('PUT /admin/blogs/:id', () => {
    it('should update a blog by ID', async () => {
      const res = await request(app)
        .put('/admin/blogs/blog-1')
        .send({ title: 'Updated Title' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Blog updated' });
    });
  });

  describe('DELETE /admin/blogs/:id', () => {
    it('should delete a blog by ID', async () => {
      const res = await request(app).delete('/admin/blogs/blog-1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Blog deleted' });
    });
  });

  // ─── Admin CRUD ───────────────────────────────────────────────────────────
  describe('POST /admin/create', () => {
    it('should create a new admin', async () => {
      const res = await request(app)
        .post('/admin/create')
        .send({ name: 'Super Admin', email: 'admin@test.com', password: 'adminpass' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: 'Admin created' });
    });

    it('should return 400 for duplicate admin email', async () => {
      adminController.createAdmin.mockImplementationOnce((req, res) =>
        res.status(400).json({ error: 'Admin already exists' })
      );
      const res = await request(app)
        .post('/admin/create')
        .send({ email: 'existing@admin.com' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /admin/login', () => {
    it('should login admin and return token', async () => {
      const res = await request(app)
        .post('/admin/login')
        .send({ email: 'admin@test.com', password: 'adminpass' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token', 'admin-token');
    });

    it('should return 401 for invalid credentials', async () => {
      adminController.loginAdmin.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Invalid credentials' })
      );
      const res = await request(app)
        .post('/admin/login')
        .send({ email: 'wrong@test.com', password: 'wrong' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /admin/', () => {
    it('should return all admins for authenticated user', async () => {
      const res = await request(app).get('/admin/');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('admins');
      expect(authMiddleware).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if not authenticated', async () => {
      authMiddleware.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Unauthorized' })
      );
      const res = await request(app).get('/admin/');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /admin/:id', () => {
    it('should return a single admin by ID', async () => {
      const res = await request(app).get('/admin/admin-123');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 'admin-123');
    });

    it('should return 404 if admin not found', async () => {
      adminController.getAdminById.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'Admin not found' })
      );
      const res = await request(app).get('/admin/nonexistent');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /admin/:id', () => {
    it('should update an admin by ID', async () => {
      const res = await request(app)
        .put('/admin/admin-123')
        .send({ name: 'Updated Admin' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Admin updated' });
    });
  });

  describe('DELETE /admin/:id', () => {
    it('should delete an admin by ID', async () => {
      const res = await request(app).delete('/admin/admin-123');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Admin deleted' });
    });
  });
});