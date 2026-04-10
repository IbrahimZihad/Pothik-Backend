/**
 * Unit Tests for Blog Controller
 * ================================
 * Tests: createBlog, getAllBlogs, getBlogById, getBlogBySlug,
 *        getBlogsByUser, updateBlog, deleteBlog
 */

const blogController = require('../controllers/blog.controller');
const { Blog, User } = require('../models');

jest.mock('../models', () => ({
  Blog: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  User: { name: 'User' },
}));

const mockRequest = (body = {}, params = {}, query = {}, user = {}, file = null) => ({
  body,
  params,
  query,
  user,
  file,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Blog Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE BLOG
  // ─────────────────────────────────────────────────────────────────────────
  describe('createBlog', () => {
    it('should create a blog and return 201', async () => {
      const blogData = { title: 'My Blog', slug: 'my-blog', content: 'Content here' };
      const createdBlog = { blog_id: 1, ...blogData, user_id: 5 };
      Blog.create.mockResolvedValue(createdBlog);

      const req = mockRequest(blogData, {}, {}, { user_id: 5 });
      const res = mockResponse();

      await blogController.createBlog(req, res);

      expect(Blog.create).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 5,
        title: 'My Blog',
        slug: 'my-blog',
        content: 'Content here',
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        blog: createdBlog,
      }));
    });

    it('should handle file upload path', async () => {
      const blogData = { title: 'Blog', slug: 'blog', content: 'Text' };
      Blog.create.mockResolvedValue({ blog_id: 1 });

      const req = mockRequest(blogData, {}, {}, { user_id: 1 }, { path: 'uploads\\blog\\image.jpg' });
      const res = mockResponse();

      await blogController.createBlog(req, res);

      expect(Blog.create).toHaveBeenCalledWith(expect.objectContaining({
        image: 'uploads/blog/image.jpg',
      }));
    });

    it('should return 400 if title is missing', async () => {
      const req = mockRequest({ slug: 'slug', content: 'content' }, {}, {}, { user_id: 1 });
      const res = mockResponse();

      await blogController.createBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return 400 if slug is missing', async () => {
      const req = mockRequest({ title: 'Title', content: 'content' }, {}, {}, { user_id: 1 });
      const res = mockResponse();

      await blogController.createBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if content is missing', async () => {
      const req = mockRequest({ title: 'Title', slug: 'slug' }, {}, {}, { user_id: 1 });
      const res = mockResponse();

      await blogController.createBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on database error', async () => {
      Blog.create.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({ title: 'T', slug: 's', content: 'c' }, {}, {}, { user_id: 1 });
      const res = mockResponse();

      await blogController.createBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL BLOGS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllBlogs', () => {
    it('should return all blogs', async () => {
      const blogs = [{ blog_id: 1, title: 'Blog 1' }];
      Blog.findAll.mockResolvedValue(blogs);

      const req = mockRequest();
      const res = mockResponse();

      await blogController.getAllBlogs(req, res);

      expect(Blog.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, blogs });
    });

    it('should return 500 on error', async () => {
      Blog.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await blogController.getAllBlogs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET BLOG BY ID
  // ─────────────────────────────────────────────────────────────────────────
  describe('getBlogById', () => {
    it('should return blog by id', async () => {
      const blog = { blog_id: 1, title: 'Blog' };
      Blog.findByPk.mockResolvedValue(blog);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await blogController.getBlogById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, blog });
    });

    it('should return 404 if blog not found', async () => {
      Blog.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await blogController.getBlogById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Blog not found' });
    });

    it('should return 500 on error', async () => {
      Blog.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await blogController.getBlogById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET BLOG BY SLUG
  // ─────────────────────────────────────────────────────────────────────────
  describe('getBlogBySlug', () => {
    it('should return blog by slug', async () => {
      const blog = { blog_id: 1, slug: 'my-blog' };
      Blog.findOne.mockResolvedValue(blog);

      const req = mockRequest({}, { slug: 'my-blog' });
      const res = mockResponse();

      await blogController.getBlogBySlug(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, blog });
    });

    it('should return 404 if blog not found', async () => {
      Blog.findOne.mockResolvedValue(null);

      const req = mockRequest({}, { slug: 'not-found' });
      const res = mockResponse();

      await blogController.getBlogBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET BLOGS BY USER
  // ─────────────────────────────────────────────────────────────────────────
  describe('getBlogsByUser', () => {
    it('should return blogs by user_id', async () => {
      const blogs = [{ blog_id: 1 }];
      Blog.findAll.mockResolvedValue(blogs);

      const req = mockRequest({}, { user_id: 5 });
      const res = mockResponse();

      await blogController.getBlogsByUser(req, res);

      expect(Blog.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: 5 },
      }));
      expect(res.json).toHaveBeenCalledWith({ success: true, blogs });
    });

    it('should return 500 on error', async () => {
      Blog.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { user_id: 5 });
      const res = mockResponse();

      await blogController.getBlogsByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE BLOG
  // ─────────────────────────────────────────────────────────────────────────
  describe('updateBlog', () => {
    it('should update blog successfully', async () => {
      Blog.update.mockResolvedValue([1]);

      const req = mockRequest({ title: 'Updated' }, { id: 1 });
      const res = mockResponse();

      await blogController.updateBlog(req, res);

      expect(Blog.update).toHaveBeenCalledWith({ title: 'Updated' }, { where: { blog_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Blog updated successfully' });
    });

    it('should return 404 if blog not found', async () => {
      Blog.update.mockResolvedValue([0]);

      const req = mockRequest({ title: 'Updated' }, { id: 999 });
      const res = mockResponse();

      await blogController.updateBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      Blog.update.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await blogController.updateBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE BLOG
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteBlog', () => {
    it('should delete blog successfully', async () => {
      Blog.destroy.mockResolvedValue(1);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await blogController.deleteBlog(req, res);

      expect(Blog.destroy).toHaveBeenCalledWith({ where: { blog_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Blog deleted successfully' });
    });

    it('should return 404 if blog not found', async () => {
      Blog.destroy.mockResolvedValue(0);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await blogController.deleteBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      Blog.destroy.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await blogController.deleteBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
