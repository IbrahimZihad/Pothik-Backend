const request = require('supertest');
const express = require('express');

// Mock auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    req.user = { id: 'user-123', email: 'test@example.com' };
    next();
  }),
}));

// Mock upload middleware (bypass real file handling)
jest.mock('../middleware/upload.middleware', () => ({
  single: () => (req, res, next) => next(),
}));

// Mock blog controller
jest.mock('../controllers/blog.controller', () => ({
  createBlog:    jest.fn((req, res) => res.status(201).json({ message: 'Blog created' })),
  getAllBlogs:   jest.fn((req, res) => res.status(200).json({ blogs: [] })),
  getBlogBySlug: jest.fn((req, res) => res.status(200).json({ slug: 'my-blog' })),
  getBlogsByUser:jest.fn((req, res) => res.status(200).json({ blogs: [] })),
  getBlogById:   jest.fn((req, res) => res.status(200).json({ id: 'blog-1' })),
  updateBlog:    jest.fn((req, res) => res.status(200).json({ message: 'Blog updated' })),
  deleteBlog:    jest.fn((req, res) => res.status(200).json({ message: 'Blog deleted' })),
}));

const blogRoutes = require('../routes/blog.routes');
const blogController = require('../controllers/blog.controller');
const { authMiddleware: verifyToken } = require('../middleware/auth.middleware');

const app = express();
app.use(express.json());
app.use('/api', blogRoutes);

describe('Blog Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── POST /api/blogs ──────────────────────────────────────────────────────
  describe('POST /api/blogs', () => {
    it('should create a blog when authenticated', async () => {
      const res = await request(app)
        .post('/api/blogs')
        .field('title', 'Test Blog')
        .field('content', 'Some content');
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: 'Blog created' });
      expect(verifyToken).toHaveBeenCalledTimes(1);
      expect(blogController.createBlog).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if not authenticated', async () => {
      verifyToken.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Unauthorized' })
      );
      const res = await request(app).post('/api/blogs').send({});
      expect(res.statusCode).toBe(401);
      expect(blogController.createBlog).not.toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      blogController.createBlog.mockImplementationOnce((req, res) =>
        res.status(400).json({ error: 'Title and content are required' })
      );
      const res = await request(app).post('/api/blogs').send({});
      expect(res.statusCode).toBe(400);
    });
  });

  // ─── GET /api/blogs ───────────────────────────────────────────────────────
  describe('GET /api/blogs', () => {
    it('should return all blogs publicly', async () => {
      const res = await request(app).get('/api/blogs');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('blogs');
      expect(verifyToken).not.toHaveBeenCalled(); // public route
    });

    it('should return 500 on server error', async () => {
      blogController.getAllBlogs.mockImplementationOnce((req, res) =>
        res.status(500).json({ error: 'Internal server error' })
      );
      const res = await request(app).get('/api/blogs');
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── GET /api/slug/:slug ──────────────────────────────────────────────────
  describe('GET /api/slug/:slug', () => {
    it('should return a blog by slug', async () => {
      const res = await request(app).get('/api/slug/my-blog');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('slug', 'my-blog');
      expect(blogController.getBlogBySlug).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if slug not found', async () => {
      blogController.getBlogBySlug.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'Blog not found' })
      );
      const res = await request(app).get('/api/slug/nonexistent-slug');
      expect(res.statusCode).toBe(404);
    });
  });

  // ─── GET /api/user/:user_id ───────────────────────────────────────────────
  describe('GET /api/user/:user_id', () => {
    it('should return blogs for a given user', async () => {
      const res = await request(app).get('/api/user/user-123');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('blogs');
      expect(blogController.getBlogsByUser).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if user has no blogs', async () => {
      blogController.getBlogsByUser.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'No blogs found for this user' })
      );
      const res = await request(app).get('/api/user/ghost-user');
      expect(res.statusCode).toBe(404);
    });
  });

  // ─── GET /api/blogs/:id/blog ──────────────────────────────────────────────
  describe('GET /api/blogs/:id/blog', () => {
    it('should return a single blog by ID', async () => {
      const res = await request(app).get('/api/blogs/blog-1/blog');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 'blog-1');
      expect(blogController.getBlogById).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if blog not found', async () => {
      blogController.getBlogById.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'Blog not found' })
      );
      const res = await request(app).get('/api/blogs/nonexistent/blog');
      expect(res.statusCode).toBe(404);
    });
  });

  // ─── PUT /api/blogs/:id ───────────────────────────────────────────────────
  describe('PUT /api/blogs/:id', () => {
    it('should update a blog when authenticated', async () => {
      const res = await request(app)
        .put('/api/blogs/blog-1')
        .field('title', 'Updated Title');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Blog updated' });
      expect(verifyToken).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if not authenticated', async () => {
      verifyToken.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Unauthorized' })
      );
      const res = await request(app).put('/api/blogs/blog-1').send({});
      expect(res.statusCode).toBe(401);
      expect(blogController.updateBlog).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not own the blog', async () => {
      blogController.updateBlog.mockImplementationOnce((req, res) =>
        res.status(403).json({ error: 'Forbidden' })
      );
      const res = await request(app).put('/api/blogs/blog-99').send({});
      expect(res.statusCode).toBe(403);
    });

    it('should return 404 if blog not found', async () => {
      blogController.updateBlog.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'Blog not found' })
      );
      const res = await request(app).put('/api/blogs/nonexistent').send({});
      expect(res.statusCode).toBe(404);
    });
  });

  // ─── DELETE /api/blogs/:id ────────────────────────────────────────────────
  describe('DELETE /api/blogs/:id', () => {
    it('should delete a blog when authenticated', async () => {
      const res = await request(app).delete('/api/blogs/blog-1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Blog deleted' });
      expect(verifyToken).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if not authenticated', async () => {
      verifyToken.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Unauthorized' })
      );
      const res = await request(app).delete('/api/blogs/blog-1');
      expect(res.statusCode).toBe(401);
      expect(blogController.deleteBlog).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not own the blog', async () => {
      blogController.deleteBlog.mockImplementationOnce((req, res) =>
        res.status(403).json({ error: 'Forbidden' })
      );
      const res = await request(app).delete('/api/blogs/blog-99');
      expect(res.statusCode).toBe(403);
    });

    it('should return 404 if blog not found', async () => {
      blogController.deleteBlog.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'Blog not found' })
      );
      const res = await request(app).delete('/api/blogs/nonexistent');
      expect(res.statusCode).toBe(404);
    });
  });
});