const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller.js");
const { authMiddleware, isAdmin } = require("../middleware/auth.middleware.js");

// Dashboard & Bookings (specific routes MUST come before /:id)
router.get("/dashboard", isAdmin, adminController.getDashboardData);


router.get("/users", isAdmin, adminController.getAllUsers);
router.post("/users", isAdmin, adminController.createUser);
router.put("/users/:id", isAdmin, adminController.updateUser);
router.delete("/users/:id", isAdmin, adminController.deleteUser);


router.get("/bookings", isAdmin, adminController.getAllBookings);
router.post("/bookings/:id/approve", isAdmin, adminController.approveBooking);
router.post("/bookings/:id/assign-guide", isAdmin, adminController.assignGuide);
router.post("/bookings/:id/cancel", isAdmin, adminController.cancelBooking);
router.post("/bookings/:id/assign-hotel", isAdmin, adminController.assignHotel);
router.post("/bookings/:id/assign-transport", isAdmin, adminController.assignTransport);

router.get("/blogs", isAdmin, adminController.getAllBlogs);
router.post("/blogs", isAdmin, adminController.createBlog);
router.put("/blogs/:id", isAdmin, adminController.updateBlog);
router.delete("/blogs/:id", isAdmin, adminController.deleteBlog);


// Admin CRUD (parameterized routes come last)
router.post("/create", adminController.createAdmin);
router.post("/login", adminController.loginAdmin);
router.get("/", authMiddleware, adminController.getAllAdmins);
router.get("/:id", authMiddleware, adminController.getAdminById);
router.put("/:id", authMiddleware, adminController.updateAdmin);
router.delete("/:id", authMiddleware, adminController.deleteAdmin);

module.exports = router;