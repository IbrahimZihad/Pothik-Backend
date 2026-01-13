const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller.js");

// -----------------------------------------------------------------------------
// BLOG ROUTES
// -----------------------------------------------------------------------------

// CREATE a new blog
router.post("/blogs", blogController.createBlog);

// GET all blogs
router.get("/blogs", blogController.getAllBlogs);

// GET blog by slug (must be before /:id to avoid conflict)
router.get("/slug/:slug", blogController.getBlogBySlug);

// GET blogs by user
router.get("/user/:user_id", blogController.getBlogsByUser);

// GET single blog by ID
router.get("/:id", blogController.getBlogById);

// UPDATE blog
router.put("/:id", blogController.updateBlog);

// DELETE blog
router.delete("/:id", blogController.deleteBlog);

module.exports = router;