const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

// All notification routes require authentication
router.use(authMiddleware);

// Get all notifications for the logged-in user
router.get("/", notificationController.getUserNotifications);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark all as read
router.put("/read-all", notificationController.markAllAsRead);

// Mark one as read
router.put("/:id/read", notificationController.markAsRead);

// Delete a notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
