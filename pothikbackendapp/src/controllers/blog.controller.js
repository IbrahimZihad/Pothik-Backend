const { Blog, User } = require("../models");
const path = require("path");
// -----------------------------------------------------------------------------
// CREATE BLOG
// -----------------------------------------------------------------------------
exports.createBlog = async (req, res) => {
  try {
    console.log("=== CREATE BLOG REQUEST ===");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { title, slug, content } = req.body;
    let { user_id } = req.body;

    // Validate user_id
    user_id = parseInt(user_id);
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid user_id is required" 
      });
    }

    // Validate required fields
    if (!title || !slug || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "Title, slug, and content are required" 
      });
    }

    // ✅ Check if image was uploaded (comes from req.file, NOT req.body)
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Image is required" 
      });
    }

    // ✅ Get the image path from req.file.path
    const imagePath = req.file.path.replace(/\\/g, '/');

    console.log("Creating blog with:", { user_id, title, slug, imagePath });

    const blog = await Blog.create({
      user_id,
      title,
      slug,
      content,
      image: imagePath, // ✅ Store the file path
    });

    console.log("✅ Blog created successfully:", blog.blog_id);

    return res.status(201).json({ 
      success: true, 
      blog,
      message: "Blog created successfully"
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    console.error(err.stack);
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: "A blog with this slug already exists"
      });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: "Invalid user_id"
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Internal Server Error"
    });
  }
};

// -----------------------------------------------------------------------------
// GET ALL BLOGS
// -----------------------------------------------------------------------------
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      include: [{ model: User, attributes: ["user_id", "full_name", "email"] }],
      order: [["created_at", "DESC"]],
    });

    return res.json({ success: true, blogs });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// GET SINGLE BLOG BY ID
// -----------------------------------------------------------------------------
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id, {
      include: [{ model: User, attributes: ["user_id", "full_name", "email"] }],
    });

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.json({ success: true, blog });
  } catch (err) {
    console.error("Error fetching blog:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// GET BLOG BY SLUG
// -----------------------------------------------------------------------------
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({
      where: { slug },
      include: [{ model: User, attributes: ["user_id", "full_name", "email"] }],
    });

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.json({ success: true, blog });
  } catch (err) {
    console.error("Error fetching blog:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// GET BLOGS BY USER
// -----------------------------------------------------------------------------
exports.getBlogsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const blogs = await Blog.findAll({
      where: { user_id },
      include: [{ model: User, attributes: ["user_id", "full_name", "email"] }],
      order: [["created_at", "DESC"]],
    });

    return res.json({ success: true, blogs });
  } catch (err) {
    console.error("Error fetching user blogs:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// UPDATE BLOG
// -----------------------------------------------------------------------------
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await Blog.update(req.body, { where: { blog_id: id } });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.json({ success: true, message: "Blog updated successfully" });
  } catch (err) {
    console.error("Error updating blog:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// DELETE BLOG
// -----------------------------------------------------------------------------
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Blog.destroy({ where: { blog_id: id } });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};