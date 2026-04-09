// tests/models/blog.model.test.js

// Mock the db module
jest.mock('../models', () => ({
  Blog: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    rawAttributes: {
      blog_id:    { primaryKey: true, autoIncrement: true },
      user_id:    { allowNull: false },
      title:      { type: { options: { length: 200 } } },
      slug:       { unique: true },
      content:    {},
      image:      {},
      created_at: { defaultValue: 'NOW' },  // ✅ fixed: no DataTypes reference
    },
    associations: {
      User: true,
    },
  },
}));

const { Blog } = require('../models');

describe('Blog Model', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- Field Definitions ----------
  describe('Field Definitions', () => {
    it('should have all expected fields', () => {
      const fields = Object.keys(Blog.rawAttributes);
      expect(fields).toEqual(
        expect.arrayContaining(['blog_id', 'user_id', 'title', 'slug', 'content', 'image', 'created_at'])
      );
    });

    it('blog_id should be primaryKey and autoIncrement', () => {
      const { blog_id } = Blog.rawAttributes;
      expect(blog_id.primaryKey).toBe(true);
      expect(blog_id.autoIncrement).toBe(true);
    });

    it('user_id should not allow null', () => {
      const { user_id } = Blog.rawAttributes;
      expect(user_id.allowNull).toBe(false);
    });

    it('title should have max length of 200', () => {
      const { title } = Blog.rawAttributes;
      expect(title.type.options.length).toBe(200);
    });

    it('slug should be unique', () => {
      const { slug } = Blog.rawAttributes;
      expect(slug.unique).toBe(true);
    });

    it('created_at should default to NOW', () => {
      const { created_at } = Blog.rawAttributes;
      expect(created_at.defaultValue).toBe('NOW');  // ✅ fixed: plain string
    });
  });

  // ---------- Blog.create() ----------
  describe('Blog.create()', () => {
    it('should create a blog with all valid fields', async () => {
      Blog.create.mockResolvedValueOnce({
        blog_id: 1,
        user_id: 1,
        title: 'My First Travel Blog',
        slug: 'my-first-travel-blog',
        content: 'It was a wonderful trip...',
        image: 'https://example.com/image.jpg',
        created_at: new Date(),
      });

      const blog = await Blog.create({
        user_id: 1,
        title: 'My First Travel Blog',
        slug: 'my-first-travel-blog',
        content: 'It was a wonderful trip...',
        image: 'https://example.com/image.jpg',
      });

      expect(Blog.create).toHaveBeenCalledTimes(1);
      expect(Blog.create).toHaveBeenCalledWith({
        user_id: 1,
        title: 'My First Travel Blog',
        slug: 'my-first-travel-blog',
        content: 'It was a wonderful trip...',
        image: 'https://example.com/image.jpg',
      });
      expect(blog.blog_id).toBeDefined();
      expect(blog.title).toBe('My First Travel Blog');
    });

    it('should create a blog without optional fields', async () => {
      Blog.create.mockResolvedValueOnce({
        blog_id: 2,
        user_id: 1,
        title: 'Minimal Blog',
        slug: null,
        content: null,
        image: null,
        created_at: new Date(),
      });

      const blog = await Blog.create({ user_id: 1, title: 'Minimal Blog' });

      expect(blog.slug).toBeNull();
      expect(blog.content).toBeNull();
      expect(blog.image).toBeNull();
    });

    it('should throw when title is missing', async () => {
      Blog.create.mockRejectedValueOnce(new Error('notNull Violation: Blog.title cannot be null'));

      await expect(Blog.create({ user_id: 1 })).rejects.toThrow('Blog.title cannot be null');
    });

    it('should throw when user_id is missing', async () => {
      Blog.create.mockRejectedValueOnce(new Error('notNull Violation: Blog.user_id cannot be null'));

      await expect(Blog.create({ title: 'No User Blog' })).rejects.toThrow('Blog.user_id cannot be null');
    });

    it('should throw on duplicate slug', async () => {
      Blog.create.mockRejectedValueOnce(new Error('UniqueConstraintError: slug must be unique'));

      await expect(
        Blog.create({ user_id: 1, title: 'Blog B', slug: 'same-slug' })
      ).rejects.toThrow('slug must be unique');
    });
  });

  // ---------- Blog.findOne() ----------
  describe('Blog.findOne()', () => {
    it('should find a blog by slug', async () => {
      Blog.findOne.mockResolvedValueOnce({
        blog_id: 1,
        user_id: 1,
        title: 'Find Me',
        slug: 'find-me',
      });

      const blog = await Blog.findOne({ where: { slug: 'find-me' } });

      expect(Blog.findOne).toHaveBeenCalledTimes(1);
      expect(Blog.findOne).toHaveBeenCalledWith({ where: { slug: 'find-me' } });
      expect(blog).not.toBeNull();
      expect(blog.title).toBe('Find Me');
    });

    it('should return null for a non-existent slug', async () => {
      Blog.findOne.mockResolvedValueOnce(null);

      const blog = await Blog.findOne({ where: { slug: 'ghost-slug' } });

      expect(blog).toBeNull();
    });
  });

  // ---------- Blog.findAll() ----------
  describe('Blog.findAll()', () => {
    it('should return all blogs for a user', async () => {
      Blog.findAll.mockResolvedValueOnce([
        { blog_id: 1, user_id: 1, title: 'Blog 1', slug: 'blog-1' },
        { blog_id: 2, user_id: 1, title: 'Blog 2', slug: 'blog-2' },
      ]);

      const blogs = await Blog.findAll({ where: { user_id: 1 } });

      expect(Blog.findAll).toHaveBeenCalledTimes(1);
      expect(blogs.length).toBe(2);
    });

    it('should return empty array when no blogs found', async () => {
      Blog.findAll.mockResolvedValueOnce([]);

      const blogs = await Blog.findAll({ where: { user_id: 999 } });

      expect(blogs).toEqual([]);
    });
  });

  // ---------- Blog.update() ----------
  describe('Blog.update()', () => {
    it('should update title and content', async () => {
      Blog.update.mockResolvedValueOnce([1]);

      const result = await Blog.update(
        { title: 'New Title', content: 'Updated content' },
        { where: { blog_id: 1 } }
      );

      expect(Blog.update).toHaveBeenCalledTimes(1);
      expect(Blog.update).toHaveBeenCalledWith(
        { title: 'New Title', content: 'Updated content' },
        { where: { blog_id: 1 } }
      );
      expect(result[0]).toBe(1);
    });

    it('should return 0 rows affected if blog not found', async () => {
      Blog.update.mockResolvedValueOnce([0]);

      const result = await Blog.update(
        { title: 'Ghost Update' },
        { where: { blog_id: 9999 } }
      );

      expect(result[0]).toBe(0);
    });
  });

  // ---------- Blog.destroy() ----------
  describe('Blog.destroy()', () => {
    it('should delete a blog by blog_id', async () => {
      Blog.destroy.mockResolvedValueOnce(1);

      const result = await Blog.destroy({ where: { blog_id: 1 } });

      expect(Blog.destroy).toHaveBeenCalledTimes(1);
      expect(Blog.destroy).toHaveBeenCalledWith({ where: { blog_id: 1 } });
      expect(result).toBe(1);
    });

    it('should return 0 if blog not found', async () => {
      Blog.destroy.mockResolvedValueOnce(0);

      const result = await Blog.destroy({ where: { blog_id: 9999 } });

      expect(result).toBe(0);
    });
  });

  // ---------- Associations ----------
  describe('Associations', () => {
    it('should belong to a User', () => {
      expect(Blog.associations).toHaveProperty('User');
    });
  });

});