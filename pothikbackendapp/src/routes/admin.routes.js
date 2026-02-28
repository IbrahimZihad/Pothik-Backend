const express = require("express");
const router = express.Router();
const adminRoutes = require("./admin.routes.js");
const adminController = require("../controllers/admin.controller.js");
<<<<<<< HEAD
const { isAdmin } = require("../middleware/auth.middleware.js");

//dashboard data
router.get("/dashboard", isAdmin, adminController.getDashboardData);
//view all bookings
router.get("/bookings", isAdmin, adminController.getAllBookings);
//approve booking
router.post("/bookings/:id/approve", isAdmin, adminController.approveBooking);
//assign guide
router.post("/bookings/:id/assign-guide", isAdmin, adminController.assignGuide);
//cancel booking
router.post("/bookings/:id/cancel", isAdmin, adminController.cancelBooking);
//assign hotel
router.post("/bookings/:id/assign-hotel", isAdmin, adminController.assignHotel);
//assign transport
router.post("/bookings/:id/assign-transport", isAdmin, adminController.assignTransport);

=======
const authMiddleware = require("../middleware/auth.middleware.js");
>>>>>>> 950144ec359eac5b55285baf4c7305f8cfcda778

router.post("/create", adminController.createAdmin);
router.post("/login", adminController.loginAdmin);
router.get("/", authMiddleware, adminController.getAllAdmins);
router.get("/:id", authMiddleware, adminController.getAdminById);
router.put("/:id", authMiddleware, adminController.updateAdmin);
router.delete("/:id", authMiddleware, adminController.deleteAdmin);
router.post("/login", adminController.loginAdmin);
module.exports = router;