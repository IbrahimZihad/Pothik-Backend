const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller.js");
const upload = require("../middleware/upload.middleware.js");
const { authMiddleware: verifyToken } = require("../middleware/auth.middleware.js");

// -----------------------------------------------------------------------------
// BLOG ROUTES
// -----------------------------------------------------------------------------

// CREATE a new blog (with image upload and authentication)
router.post(
  "/blogs",
  verifyToken,            // Verify user is logged in
  upload.single("image"), // Handle single image upload
  blogController.createBlog
);

// GET all blogs (public)
router.get("/blogs", blogController.getAllBlogs);

// GET blog by slug (must be before /:id to avoid conflict) (public)
router.get("/slug/:slug", blogController.getBlogBySlug);

// GET blogs by user (public)
router.get("/user/:user_id", blogController.getBlogsByUser);

// GET single blog by ID (public)
router.get("/blogs/:id/blog", blogController.getBlogById);

// UPDATE blog (with optional image upload and authentication)
router.put(
  "/blogs/:id",
  verifyToken,            // Verify user is logged in
  upload.single("image"), // Optional image upload
  blogController.updateBlog
);

// DELETE blog (with authentication)
router.delete(
  "/blogs/:id",
  verifyToken,            // Verify user is logged in
  blogController.deleteBlog
);

module.exports = router;